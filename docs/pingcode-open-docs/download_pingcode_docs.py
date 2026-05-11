#!/usr/bin/env python3
"""Download the public PingCode REST API documentation for offline reference."""

from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from pathlib import Path
from typing import Any

BASE_URL = "https://open.pingcode.com/"
USER_AGENT = "PingCodeDocsDownloader/1.0 (+offline personal reference)"

DATA_FILES = {
    "api_project.js": "api_project.json",
    "api_data.js": "api_data.json",
}


def fetch_text(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def can_fetch(url: str) -> bool:
    robots_url = urllib.parse.urljoin(BASE_URL, "robots.txt")
    parser = urllib.robotparser.RobotFileParser(robots_url)
    try:
        parser.read()
    except Exception:
        return True
    return parser.can_fetch(USER_AGENT, url)


def parse_define_js(source: str) -> Any:
    source = source.strip()
    match = re.match(r"^define\((.*)\);?\s*$", source, flags=re.DOTALL)
    if not match:
        raise ValueError("Unsupported JavaScript module format: expected define({...});")
    return json.loads(match.group(1))


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def slug(value: str, fallback: str = "untitled") -> str:
    value = clean_text(value) or fallback
    value = re.sub(r"[\\/:*?\"<>|]+", "-", value)
    value = re.sub(r"\s+", "_", value).strip("._- ")
    return value[:120] or fallback


def render_examples(title: str, examples: list[dict[str, Any]]) -> list[str]:
    lines: list[str] = []
    if not examples:
        return lines
    lines.append(f"#### {title}")
    for example in examples:
        example_title = clean_text(example.get("title"))
        content = str(example.get("content") or "").strip()
        language = clean_text(example.get("type")) or "text"
        if example_title:
            lines.append(f"**{example_title}**")
        lines.append(f"```{language}")
        lines.append(content)
        lines.append("```")
        lines.append("")
    return lines


def render_fields(title: str, fields: dict[str, list[dict[str, Any]]] | None) -> list[str]:
    lines: list[str] = []
    if not fields:
        return lines
    lines.append(f"#### {title}")
    for group_name, items in fields.items():
        lines.append(f"**{clean_text(group_name)}**")
        lines.append("")
        lines.append("| 字段 | 类型 | 必填 | 说明 |")
        lines.append("| --- | --- | --- | --- |")
        for item in items:
            field = clean_text(item.get("field"))
            field_type = clean_text(item.get("type"))
            required = "否" if item.get("optional") else "是"
            description = clean_text(item.get("description")).replace("\n", "<br>")
            default_value = clean_text(item.get("defaultValue"))
            allowed_values = item.get("allowedValues") or []
            size = clean_text(item.get("size"))
            extras = []
            if default_value:
                extras.append(f"默认值: `{default_value}`")
            if allowed_values:
                extras.append("可选值: " + ", ".join(f"`{clean_text(v)}`" for v in allowed_values))
            if size:
                extras.append(f"范围: `{size}`")
            if extras:
                description = (description + "<br>" if description else "") + "<br>".join(extras)
            lines.append(f"| `{field}` | {field_type} | {required} | {description} |")
        lines.append("")
    return lines


def render_article(article: dict[str, Any], project_url: str) -> str:
    title = clean_text(article.get("title")) or clean_text(article.get("name")) or article.get("url", "Untitled")
    method = clean_text(article.get("type"))
    url = clean_text(article.get("url"))
    full_url = url
    if project_url and url.startswith("/"):
        full_url = project_url.rstrip("/") + url

    lines = [f"### {title}", ""]
    if method or url:
        lines.append(f"**接口:** `{method} {full_url}`".strip())
        lines.append("")

    description = clean_text(article.get("description"))
    if description:
        lines.append(description)
        lines.append("")

    permissions = article.get("permission") or []
    if permissions:
        names = ", ".join(clean_text(item.get("name")) for item in permissions if item.get("name"))
        if names:
            lines.append(f"**权限:** {names}")
            lines.append("")

    deprecated = article.get("deprecated")
    if deprecated:
        lines.append(f"**已废弃:** {clean_text(deprecated.get('content'))}")
        lines.append("")

    for block_title, key in (
        ("Headers", "header"),
        ("Parameters", "parameter"),
        ("Success", "success"),
        ("Error", "error"),
    ):
        block = article.get(key) or {}
        lines.extend(render_fields(block_title, block.get("fields")))
        lines.extend(render_examples(f"{block_title} Examples", block.get("examples") or []))

    examples = article.get("examples") or []
    lines.extend(render_examples("Examples", examples))

    return "\n".join(lines).rstrip() + "\n"


def group_articles(articles: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for article in articles:
        group_title = clean_text(article.get("groupTitle")) or clean_text(article.get("group")) or "其他"
        grouped.setdefault(group_title, []).append(article)
    return grouped


def sort_groups(grouped: dict[str, list[dict[str, Any]]], order: list[str]) -> list[tuple[str, list[dict[str, Any]]]]:
    remaining = dict(grouped)
    result: list[tuple[str, list[dict[str, Any]]]] = []
    for name in order:
        key = next((group for group in remaining if group == name), None)
        if key is not None:
            result.append((key, remaining.pop(key)))
    result.extend(sorted(remaining.items(), key=lambda item: item[0]))
    return result


def write_markdown(project: dict[str, Any], api_data: dict[str, Any], out_dir: Path) -> None:
    project_url = clean_text(project.get("url"))
    grouped = group_articles(api_data.get("api") or [])
    ordered_groups = sort_groups(grouped, project.get("order") or [])

    md_dir = out_dir / "markdown"
    md_dir.mkdir(parents=True, exist_ok=True)

    index_lines = [f"# {clean_text(project.get('title')) or 'PingCode REST API'}", ""]
    description = clean_text(project.get("description"))
    if description:
        index_lines.extend([description, ""])
    index_lines.append("## 目录")
    index_lines.append("")

    all_lines = [f"# {clean_text(project.get('title')) or 'PingCode REST API'}", ""]

    for index, (group_name, articles) in enumerate(ordered_groups, start=1):
        filename = f"{index:03d}-{slug(group_name)}.md"
        index_lines.append(f"- [{group_name}](markdown/{filename})")
        group_lines = [f"# {group_name}", ""]
        all_lines.extend([f"## {group_name}", ""])
        for article in articles:
            article_md = render_article(article, project_url)
            group_lines.append(article_md)
            all_lines.append(article_md)
        (md_dir / filename).write_text("\n".join(group_lines).rstrip() + "\n", encoding="utf-8")

    (out_dir / "README.md").write_text("\n".join(index_lines).rstrip() + "\n", encoding="utf-8")
    (out_dir / "pingcode-rest-api.md").write_text("\n".join(all_lines).rstrip() + "\n", encoding="utf-8")


def download(out_dir: Path, delay: float) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    parsed: dict[str, Any] = {}
    for remote_name, json_name in DATA_FILES.items():
        url = urllib.parse.urljoin(BASE_URL, remote_name)
        if not can_fetch(url):
            raise PermissionError(f"robots.txt disallows fetching {url}")
        print(f"Downloading {url}")
        source = fetch_text(url)
        (raw_dir / remote_name).write_text(source, encoding="utf-8")
        data = parse_define_js(source)
        (out_dir / json_name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        parsed[remote_name] = data
        time.sleep(delay)

    write_markdown(parsed["api_project.js"], parsed["api_data.js"], out_dir)
    print(f"Done. Documentation saved to: {out_dir.resolve()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Download public PingCode REST API docs for offline reference.")
    parser.add_argument("-o", "--out", default="pingcode_docs", help="Output directory. Default: pingcode_docs")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay in seconds between requests. Default: 1.0")
    args = parser.parse_args()

    try:
        download(Path(args.out), args.delay)
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"HTTP error {exc.code}: {exc.reason}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Network error: {exc.reason}") from exc


if __name__ == "__main__":
    main()
