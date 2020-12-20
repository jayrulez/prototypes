#include <iostream>
#include <memory>

class Resource {
 public:
  Resource() { std::cout << "res ctor\n"; }
  Resource(const Resource& r) { std::cout << "res copy\n"; }
  ~Resource() { std::cout << "res dtor\n"; }
};

Resource CreateResource() {
  Resource res = Resource();
  return res;
}

int main() {
  Resource r1 = CreateResource();
}
