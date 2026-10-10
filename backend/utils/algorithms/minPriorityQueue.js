/**
 * MinPriorityQueue
 * Mimics C++ std::priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>>
 * Elements stored as [priority/dist, node/val]
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  empty() {
    return this.heap.length === 0;
  }

  top() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  push(element) {
    this.heap.push(element);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.empty()) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._bubbleDown(0);
    }
    return top;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index][0] < this.heap[parentIdx][0]) {
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild][0] < this.heap[smallest][0]) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild][0] < this.heap[smallest][0]) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

module.exports = MinPriorityQueue;
