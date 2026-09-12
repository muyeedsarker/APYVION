// APYVION — App Builder Knowledge Base (Master Structure Section 04)
// দায়িত্ব: প্রতিটা App Category-র জন্য একটা যুক্তিসঙ্গত Database Entity সেট রাখা,
// যাতে App Builder Category অনুযায়ী schema.sql ও backend route stub তৈরি করতে পারে।
// এটা একটা শুরুর বিন্দু (Starting Point) — প্রকৃত প্রয়োজন অনুযায়ী পরিবর্তন করা উচিত।

window.JORON_BUILDER_ENTITIES = {
  matrimony: [
    { name: "profiles", fields: ["id", "user_id", "full_name", "age", "gender", "religion", "bio", "photo_url", "created_at"] },
    { name: "matches", fields: ["id", "profile_id_a", "profile_id_b", "status", "created_at"] },
    { name: "messages", fields: ["id", "match_id", "sender_id", "body", "sent_at"] },
  ],
  restaurant: [
    { name: "menu_items", fields: ["id", "name", "description", "price", "category", "is_available"] },
    { name: "orders", fields: ["id", "customer_id", "status", "total", "created_at"] },
    { name: "order_items", fields: ["id", "order_id", "menu_item_id", "quantity", "price"] },
    { name: "reservations", fields: ["id", "customer_id", "table_no", "reserved_at", "party_size"] },
  ],
  ecommerce: [
    { name: "products", fields: ["id", "name", "description", "price", "stock", "image_url"] },
    { name: "orders", fields: ["id", "customer_id", "status", "total", "created_at"] },
    { name: "order_items", fields: ["id", "order_id", "product_id", "quantity", "price"] },
    { name: "customers", fields: ["id", "name", "email", "phone", "address"] },
  ],
  booking: [
    { name: "services", fields: ["id", "name", "description", "duration_minutes", "price"] },
    { name: "bookings", fields: ["id", "customer_id", "service_id", "scheduled_at", "status"] },
    { name: "customers", fields: ["id", "name", "email", "phone"] },
  ],
  education: [
    { name: "courses", fields: ["id", "title", "description", "instructor_id", "price"] },
    { name: "enrollments", fields: ["id", "course_id", "student_id", "enrolled_at", "progress"] },
    { name: "lessons", fields: ["id", "course_id", "title", "content_url", "order_index"] },
  ],
  generic: [
    { name: "items", fields: ["id", "title", "description", "owner_id", "created_at"] },
    { name: "users", fields: ["id", "name", "email", "role", "created_at"] },
  ],
};

// সব Category-তেই থাকে এমন Base Table — শুধু needsAuth সত্য হলে যুক্ত হয়
window.JORON_BUILDER_AUTH_TABLE = {
  name: "users",
  fields: ["id", "name", "email", "password_hash", "role", "created_at"],
};
