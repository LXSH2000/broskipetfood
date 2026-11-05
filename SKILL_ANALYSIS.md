# Skill library analysis

Generated: 2026-09-22 00:07:12 +05:30

Scope: live primary library, every indexed source, installed skill directory, Codex skill directory and local plugin cache. Read file contents for metadata extraction, placeholder detection and SHA-256 comparison; classify by folder-name rules. This is a complete inventory of discovered files, not a semantic review or execution test of every workflow. Only selected orchestration workflows were read and applied in depth.

- Indexed records: 1245
- Discovered/indexed file paths: 1319
- Readable non-placeholder file paths: 1317
- Distinct usable file-content hashes: 1293
- Missing/unreadable paths: 0
- Broken placeholder paths: 2

## Coverage by provisional home department

| Department | Distinct workflows |
|---|---:|
| Executive Office | 12 |
| Product and Projects | 47 |
| Software Engineering | 93 |
| Cloud and Reliability | 20 |
| Cybersecurity and Privacy | 31 |
| Data and Analytics | 22 |
| AI and Language Models | 47 |
| GPU and High Performance Computing | 41 |
| Robotics and Physical AI | 79 |
| Networks and Embedded Systems | 115 |
| Design and User Experience | 56 |
| Film Video and Audio | 76 |
| Games and Immersive Media | 20 |
| Writing and Publishing | 13 |
| Marketing and Search | 83 |
| Sales and Customer Success | 22 |
| Commerce and Business Operations | 22 |
| Finance and Investment Research | 88 |
| Legal and Governance | 14 |
| People and Learning | 8 |
| Research and Science | 15 |
| Health and Life Sciences | 42 |
| Built Environment and GIS | 26 |
| Documents and Office Production | 46 |
| Quality and Verification | 38 |
| Personal Productivity and Generalists | 217 |

## Findings and limits

- Library breadth supports software, AI, creative production, business, finance, scientific work and many niche domains. Role names are responsibilities; actual capability depends on the selected workflow, model, available tools and evidence.
- Exact hashes identify redundant copies; near-duplicates and translated roles are retained. Directory presence and index status do not prove a workflow runs.
- council and officecli placeholder entries are excluded. The separate officecli-* workflows remain eligible.
- NVIDIA/GPU, rendering, publishing and connector workflows may need unavailable hardware, runtimes, accounts or API access. Check prerequisites on demand; no services were installed or authenticated by this setup.
- Recommended but uninstalled plugins are not available integrations. No communication, purchase, publishing or deployment authority is created by a role definition.
- Name-based routing is provisional, especially for general-purpose and multilingual skills. Search metadata and inspect the full source before selecting skills; cross-department candidates are retained in the inventory.
- This session supports four concurrent agents including ATLAS. Larger teams work in waves. No background daemon, schedule or account-wide configuration was created.

## Rebuild

Run `./build-team.ps1` in this workspace after library changes. Generated inventory and roster files will be refreshed. The operating manual and workspace AGENTS.md are maintained separately.
