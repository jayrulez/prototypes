#include <iostream>
#include <memory>
#include <string>

class MyResource {
 public:
  std::string name;
  float count;
  ~MyResource() { std::cout << "res dtor" << std::endl; }
};

class MyContainer {
 public:
  std::unique_ptr<MyResource> res;
  // MyResource r0;
  // MyResource* res;
  MyContainer() : MyContainer("") {}
  MyContainer(const std::string& name) {
    res = std::make_unique<MyResource>();
    // res = new MyResource();
    res->name = name;
    res->count = 0.0f;
  }
  ~MyContainer() { std::cout << "container dtor" << std::endl; }
};

void testResourceLeak() {
  MyContainer c1;
  MyContainer c2("hello");
  std::cout << c2.res->name << std::endl;
}

int main() {
  testResourceLeak();
  std::cout << "return..." << std::endl;
}
