vocab = [
    'asalto a la camara',
    'catacumbas',
    'el juego de joe',
    'reino mistico',
    'totem viviente'
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