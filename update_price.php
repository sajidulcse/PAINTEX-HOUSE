<?php
// Allow CORS for all origins
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Database connection details
$servername = "localhost";
$username = "root"; // replace with your MySQL username
$password = ""; // replace with your MySQL password
$dbname = "online_store";

// Create a connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => "Connection failed: " . $conn->connect_error]));
}

// Prepare the SQL query to retrieve product prices
$sql = "SELECT product_name, price FROM products";
$result = $conn->query($sql);

$productPrices = [];
if ($result->num_rows > 0) {
    // Fetch the results and store them in the $productPrices array
    while ($row = $result->fetch_assoc()) {
        $productPrices[$row['product_name']] = $row['price'];
    }
} else {
    echo json_encode(['success' => false, 'error' => "No products found"]);
    exit();
}

// Close the connection
$conn->close();

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate and sanitize input
    $productId = isset($_POST['productId']) ? $_POST['productId'] : null;
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

    if ($productId && isset($productPrices[$productId])) {
        // Calculate the new price based on quantity
        $newPrice = $productPrices[$productId] * $quantity;
        echo json_encode(['success' => true, 'newPrice' => $newPrice]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Product not found or invalid input']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>
