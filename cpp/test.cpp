#include <cstdio>
#include <string>

struct MyData {
  std::string* name;
  float count;
};

class Base {
 private:
  MyData _myData;

 public:
  Base() { printf("Name is null? %d\n", _myData.name == nullptr); }
};

int main() {
  Base base;
  return 0;
}
