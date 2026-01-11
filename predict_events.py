from collections import Counter, defaultdict
from nltk.util import ngrams


def build_ngram_model(events, n):
    if len(events) < n:
        return None

    ngram_list = list(ngrams(events, n))
    ngram_counts = Counter(ngram_list)
    context_counts = Counter([ng[:-1] for ng in ngram_list])
    conditional_probs = defaultdict(dict)

    for ng, count in ngram_counts.items():
        context = ng[:-1]
        next_event = ng[-1]
        conditional_probs[context][next_event] = count / context_counts[context]
    return conditional_probs


def predict_next_event(events, n):
    model = build_ngram_model(events, n)

    if model is None:
        return None, None, None
    context = tuple(events[-(n - 1):])

    if context not in model:
        return context, None, None

    probs = model[context]
    best_event = max(probs, key=probs.get)
    return context, best_event, probs
