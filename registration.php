<?php
// Подключение к базе данных
$servername = "localhost";
$username = "root";
$password = "";
$database = "site";

$conn = new mysqli($servername, $username, $password, $database);

// Проверка подключения
if ($conn->connect_error) {
die("Connection failed: " . $conn->connect_error);
}

// Обработка данных из формы
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$email = $_POST["email"];
$password = $_POST["password"];
$confirmPassword = $_POST["confirm_password"]; // Получаем значение подтверждения пароля

// Проверяю, совпадают ли пароль и его подтверждение
if ($password !== $confirmPassword) {
echo "Пароль и подтверждение пароля не совпадают";
exit;
}

// Хеширование пароля 
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Подготовка SQL-запроса и выполнение
$sql = "INSERT INTO users (email, password) VALUES ('$email', '$hashedPassword')";

if ($conn->query($sql) === TRUE) {
echo "Регистрация успешна!";
} else {
echo "Ошибка при регистрации: " . $conn->error;
}
}

$conn->close();
?>
