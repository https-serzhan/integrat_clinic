from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class RepositoryStructureTests(unittest.TestCase):
    def test_required_root_entries_exist(self):
        for relative_path in (
            "src",
            "docs",
            "tests",
            "assets",
            "README.md",
            ".gitignore",
            ".env.example",
            "LICENSE",
        ):
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_source_directories_exist(self):
        for relative_path in (
            "src/pages",
            "src/styles",
            "src/scripts",
            "src/backend/api",
            "src/backend/academy",
            "assets/images",
            "assets/icons",
        ):
            self.assertTrue((ROOT / relative_path).is_dir(), relative_path)

    def test_backend_entrypoints_exist(self):
        for relative_path in (
            "src/backend/api/app.py",
            "src/backend/api/schema.sql",
            "src/backend/academy/server.js",
            "src/backend/academy/package.json",
        ):
            self.assertTrue((ROOT / relative_path).is_file(), relative_path)


if __name__ == "__main__":
    unittest.main()
