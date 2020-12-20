#include <iostream>
#include <memory>

class Resource {
 public:
  Resource(int n) : num(n) { std::cout << "default ctor" << std::endl; }
  Resource(const Resource& r) {
    std::cout << "copy ctor" << std::endl;
    num = r.num;
  }
  Resource& operator=(const Resource& r) {
    std::cout << "copy assignment operator" << std::endl;
    num = r.num;
    return *this;
  }
  Resource(Resource&& r) {
    std::cout << "move ctor" << std::endl;
    num = r.num;
  }
  Resource& operator=(Resource&& r) {
    std::cout << "move assignment operator" << std::endl;
    num = r.num;
    return *this;
  }
  ~Resource() { std::cout << "default dtor " << num << std::endl; }
  int num;
};

Resource createResource() {
  Resource r1(1);
  r1.num = 123;
  return r1;
}

void testDefaultCtor() {
  Resource r1(1), r2(2);
  printf("%d %d\n", r1.num, r2.num);
}

void testCopyCtor() {
  Resource r1(1);
  r1.num = 123;
  auto r2 = r1;
  printf("%d %d\n", r1.num, r2.num);
}

void testCopyAssignmentOperator() {
  Resource r1(1), r2(2);
  r1.num = 123;
  r2 = r1;
  printf("%d %d\n", r1.num, r2.num);
}

void testMoveCtor() {
  Resource r1(1);
  r1.num = 123;
  auto r2 = std::move(r1);
  printf("%d %d\n", r1.num, r2.num);
}

void testMoveAssignmentOperator() {
  Resource r1(1), r2(2);
  r1.num = 123;
  r2 = std::move(r1);
  // r2 = createResource();
  printf("%d %d\n", r1.num, r2.num);
}

int main() {
  // testDefaultCtor();
  // testCopyCtor();
  // testCopyAssignmentOperator();
  // testMoveCtor();
  // testMoveAssignmentOperator();
  // auto r = createResource();
  printf("before main return...\n");
}
