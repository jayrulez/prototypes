#include <iostream>
#include <memory>

class Node {
 public:
  Node(int n) : num(n) { std::cout << "default ctor" << std::endl; }
  Node(const Node& r) {
    std::cout << "copy ctor" << std::endl;
    num = r.num;  // manually implement
  }
  Node& operator=(const Node& r) {
    std::cout << "copy assignment operator" << std::endl;
    num = r.num;  // manually implement
    return *this;
  }
  // Node(Node&& r) {
  //   std::cout << "move ctor" << std::endl;
  //   std::cout << "count from src is " << r.num << std::endl;
  // }
  ~Node() { std::cout << "default dtor " << num << std::endl; }
  int num;
};

Node CreateNode() {
  Node r1(1), r2(2);
  r1.num = 123;
  // auto r3 = std::move(res);
  r2 = r1;
  printf("%d %d\n", r1.num, r2.num);
  return r2;
}

int main() {
  Node r = CreateNode();
  printf("before main return...\n");
}
