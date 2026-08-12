import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import build_imported_game_record, build_practice_deck, build_practice_summary


class ChessComImportTests(unittest.TestCase):
    def test_build_imported_game_record_extracts_summary(self):
        raw_game = {
            "url": "https://www.chess.com/game/live/12345",
            "pgn": "[Event \"Live Chess\"]\n[White \"Alice\"]\n[Black \"Bob\"]\n\n1. e4 e5 1-0",
            "time_control": "600+5",
            "end_time": 1712345678,
            "rules": "chess",
            "white": {"username": "Alice"},
            "black": {"username": "Bob"},
            "result": "white",
        }

        record = build_imported_game_record(raw_game, "Alice")

        self.assertEqual(record["source_url"], raw_game["url"])
        self.assertEqual(record["player_username"], "Alice")
        self.assertEqual(record["result"], "1-0")
        self.assertTrue(record["summary"].startswith("Alice vs Bob"))
        self.assertEqual(record["rules"], "chess")

    def test_build_practice_summary_uses_imported_games(self):
        games = [
            {"move_count": 12, "result": "1-0"},
            {"move_count": 24, "result": "0-1"},
            {"move_count": 8, "result": "*"},
        ]

        summary = build_practice_summary(games)

        self.assertGreaterEqual(summary[0]["count"], 1)
        self.assertEqual(summary[0]["title"], "Daily Puzzles")
        self.assertGreaterEqual(summary[1]["count"], 1)
        self.assertEqual(summary[3]["title"], "Endgame mistakes")

    def test_build_practice_deck_returns_reviewable_games(self):
        games = [
            {"id": "1", "summary": "Alice vs Bob", "move_count": 12, "result": "1-0", "pgn": "[Event \"Test\"]\n\n1. e4 e5 1-0"},
            {"id": "2", "summary": "Charlie vs Dana", "move_count": 20, "result": "0-1", "pgn": "[Event \"Test\"]\n\n1. d4 d5 0-1"},
        ]

        deck = build_practice_deck(games, "opening-mistakes")

        self.assertEqual(deck["key"], "opening-mistakes")
        self.assertEqual(deck["games"][0]["id"], "1")
        self.assertTrue(deck["games"][0]["review_moves"])
        self.assertEqual(deck["games"][0]["review_moves"][0]["san"], "e4")


if __name__ == "__main__":
    unittest.main()
