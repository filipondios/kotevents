vocab = [
    'vault heist',
    'catacombs',
    "joe's game",
    'mystic realm',
    'living totem'
]

def load_events(filename='events.txt'):
    try:
        with open(filename, 'r') as f:
            return f.read().splitlines()
    except FileNotFoundError:
        return []

def save_event(event, filename='events.txt'):
    with open(filename, 'a') as f:
        f.write(event + '\n')