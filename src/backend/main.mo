import Float "mo:core/Float";
import List "mo:core/List";
import Map "mo:core/Map";

import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

// Migrate stable state on all upgrades!

actor {
  type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceINR : Float;
    category : Text;
    inStock : Bool;
  };

  type Order = {
    id : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    address : Text;
    productId : Text;
    quantity : Nat;
    timestamp : Time.Time;
  };

  type PaymentSettings = {
    upiId : Text;
    instructions : Text;
  };

  type Category = {
    id : Text;
    name : Text;
    emoji : Text;
    description : Text;
  };

  var orderCounter = 0;
  var productCounter = 9;
  var categoryCounter = 4;

  let productsList = List.fromArray<Product>([
    {
      id = "1";
      name = "Mushroom Charm";
      description = "A lucky little mushroom to brighten your day ✨";
      priceINR = 249.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "2";
      name = "Flower Charm";
      description = "Delicate petals frozen in time, shaped by hand 🌸";
      priceINR = 229.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "3";
      name = "Cat Charm";
      description = "A tiny feline companion for your keys 🐱";
      priceINR = 269.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "4";
      name = "Strawberry Charm";
      description = "Sweet and vivid, just like summer 🍓";
      priceINR = 219.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "5";
      name = "Sunflower Charm";
      description = "Always facing the light, always happy 🌻";
      priceINR = 239.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "6";
      name = "Bunny Charm";
      description = "Soft and gentle, made with so much care 🐰";
      priceINR = 259.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "7";
      name = "Heart Charm";
      description = "A little token of love for the people you adore 💛";
      priceINR = 199.0;
      category = "clay-charms";
      inStock = true;
    },
    {
      id = "8";
      name = "Cloud Charm";
      description = "Dreamy and soft like a summer cloud ☁️";
      priceINR = 229.0;
      category = "clay-charms";
      inStock = true;
    },
  ]);

  let categoryList = List.fromArray<Category>([
    {
      id = "1";
      name = "Clay Charms";
      emoji = "🧸";
      description = "tiny clay trinkets for your bags, keys, and everything in between~";
    },
    {
      id = "2";
      name = "Phone Hippers";
      emoji = "📱";
      description = "cute clay pieces that live on your phone case like a little best friend";
    },
    {
      id = "3";
      name = "Worry Stones";
      emoji = "🪨";
      description = "smooth little stones to hold when the world feels a little too loud";
    },
  ]);

  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Text, Order>();
  let categories = Map.empty<Text, Category>();

  for (product in productsList.values()) {
    products.add(product.id, product);
  };

  for (cat in categoryList.values()) {
    categories.add(cat.id, cat);
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, priceINR : Float, category : Text) : async Text {
    let id = productCounter.toText();
    productCounter += 1;
    let newProduct = {
      id;
      name;
      description;
      priceINR;
      category;
      inStock = true;
    };
    products.add(id, newProduct);
    id;
  };

  public shared ({ caller }) func updateProductStock(id : Text, inStock : Bool) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        products.add(id, { p with inStock });
      };
    };
  };

  public shared ({ caller }) func placeOrder(customerName : Text, phone : Text, email : Text, address : Text, productId : Text, quantity : Nat) : async Text {
    if (quantity == 0) {
      Runtime.trap("Quantity must be at least 1");
    };

    let orderId = "order_" # orderCounter.toText();
    orderCounter += 1;

    let newOrder = {
      id = orderId;
      customerName;
      phone;
      email;
      address;
      productId;
      quantity;
      timestamp = Time.now();
    };

    orders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getBestSellers() : async [Product] {
    products.values().toArray();
  };

  public shared query ({ caller }) func getAllOrders(adminId : Principal) : async [Order] {
    orders.values().toArray();
  };

  public shared query ({ caller }) func getProductForCustomer(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  var paymentSettings : PaymentSettings = {
    upiId = "";
    instructions = "";
  };

  public query ({ caller }) func getPaymentSettings() : async PaymentSettings {
    paymentSettings;
  };

  public shared ({ caller }) func setPaymentSettings(upiId : Text, instructions : Text) : async () {
    paymentSettings := {
      upiId;
      instructions;
    };
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared ({ caller }) func addCategory(name : Text, emoji : Text, description : Text) : async Text {
    let id = categoryCounter.toText();
    categoryCounter += 1;
    let newCategory = { id; name; emoji; description };
    categories.add(id, newCategory);
    id;
  };

  public shared ({ caller }) func removeCategory(id : Text) : async () {
    ignore categories.remove(id);
  };
};
