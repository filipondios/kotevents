import argparse
from update_events import load_events, save_event, vocab
from predict_events import predict_next_event

def main():
    # create a command line parser
    parser = argparse.ArgumentParser(description='Prediction of game events')
    subparsers = parser.add_subparsers(dest='mode', required=True)
    add_parser = subparsers.add_parser('add', help='Add new event')
    add_parser.add_argument("event", type=str, help='Name of the event to add')
    pred_parser = subparsers.add_parser('predict', help='Predict next event')
    pred_parser.add_argument('-n', '--ngram', type=int, default=5, help='Size of the n-gram (default 5)')
    args = parser.parse_args()

    events = load_events()
    if args.mode == 'add':
        # add event mode
        if args.event not in vocab:
            print('Event not valid. Must be one of:')
            for v in vocab:
                print(' -', v)
            return

        save_event(args.event)
        print(f'Event added: {args.event}')
        print(f'Total now: {len(load_events())} events')

    if args.mode == 'predict':
        # predict event mode
        n = args.ngram

        print(f'Using n-gram of size n={n}')
        print(f'Historical events loaded: {len(events)}')
        context, prediction, probs = predict_next_event(events, n)

        if context is None:    raise Exception('Not enough events to form a context.')
        if prediction is None: raise Exception('Context not found in data. (sparseness)')

        print(f'Context used: {context}')
        print('Conditional probabilities:')
        for k, v in probs.items():
            print(f'  {k}: {v:.3f}')
        print(f'Prediction: {prediction}')

if __name__ == "__main__":
    main()