import numpy as np

WEIGHTS = [0.3, 0.25, 0.15, 0.1, 0.1, 0.1]
TYPES = ['cost', 'benefit', 'cost', 'cost', 'cost', 'benefit']

SDGS_MAP = {
    "Fakir": "SDG 1: No Poverty",
    "Miskin": "SDG 2: Zero Hunger",
    "Gharimin": "SDG 1: No Poverty",
    "Fi Sabilillah": "SDG 4: Quality Education",
    "Amil": "SDG 8: Decent Work",
    "Mampu": "N/A"
}

def saw_scoring(data_matrix, weights=WEIGHTS, types=TYPES):
    if not data_matrix:
        return []
    matrix = np.array(data_matrix, dtype=float)
    normalized = np.zeros_like(matrix)
    for j in range(matrix.shape[1]):
        col = matrix[:, j]
        if types[j] == 'benefit':
            max_val = np.max(col)
            normalized[:, j] = col / max_val if max_val != 0 else 0
        else: # cost
            min_val = np.min(col)
            normalized[:, j] = np.where(col != 0, min_val / col, 1.0)
    return np.dot(normalized, weights)
