import sys
import os
import unittest
import numpy as np

# Add project root to path to import ai_engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from ai_engine.utils import saw_scoring, WEIGHTS, TYPES

class TestZakatTrackLogic(unittest.TestCase):
    def test_saw_scoring_valid(self):
        # Sample data: [income, dependents, assets, house, utility, health]
        data = [
            [1000000, 2, 5000000, 1, 100000, 1], # Mustahik A
            [500000, 4, 2000000, 1, 50000, 2]    # Mustahik B
        ]
        scores = saw_scoring(data, WEIGHTS, TYPES)
        
        self.assertEqual(len(scores), 2)
        # Mustahik B should have higher priority score because of lower income and higher health issues/dependents
        self.assertGreater(scores[1], scores[0])
        
    def test_saw_scoring_empty(self):
        self.assertEqual(saw_scoring([], WEIGHTS, TYPES), [])

if __name__ == '__main__':
    unittest.main()
