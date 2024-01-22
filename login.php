<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$database = "site";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    $sql = "SELECT id, password FROM users WHERE email='$email'";
    $result = $conn->query($sql);

    if ($result) {
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $hashedPassword = $row["password"];

            if (password_verify($password, $hashedPassword)) {
                $_SESSION['user_id'] = $row["id"];
                header("Location: gallery.html");
                exit();
            } else {
                echo "Неверный пароль. Пожалуйста, попробуйте снова.";
            }
        } else {
            echo "Пользователь с таким email не найден.";
        }
    } else {
        echo "Ошибка запроса: " . $conn->error;
    }

    $conn->close();
}
?>
