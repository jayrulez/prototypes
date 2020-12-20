use std::io;

fn main() {
    println!("Input content:");
    let mut input = String::new();
    let size = io::stdin()
        .read_line(&mut input)
        .expect("Failed to read line");
    println!("You input {}", input);
    println!("Size is {}", size);
}
