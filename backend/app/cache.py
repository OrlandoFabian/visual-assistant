from collections import OrderedDict
from threading import Lock


class LRUCache[T]:
    def __init__(self, max_size: int = 128) -> None:
        self._store: OrderedDict[str, T] = OrderedDict()
        self._max_size = max_size
        self._lock = Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> T | None:
        with self._lock:
            if key not in self._store:
                self.misses += 1
                return None
            value = self._store.pop(key)
            self._store[key] = value
            self.hits += 1
            return value

    def put(self, key: str, value: T) -> None:
        with self._lock:
            if key in self._store:
                self._store.pop(key)
            self._store[key] = value
            while len(self._store) > self._max_size:
                self._store.popitem(last=False)

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
            self.hits = 0
            self.misses = 0

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)
