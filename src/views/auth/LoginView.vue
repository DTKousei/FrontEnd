<template>
  <div class="login-container">
    <!-- Left Side - Image -->
    <div class="login-left">
      <div class="login-left-content">
        <img src="/img/logo-ugel.png" alt="Sistema de Asistencia" />
        <h2>Bienvenido</h2>
        <p>Sistema de Control de Asistencia<br />UGEL Sucre</p>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <form @submit.prevent="handleLogin">
      <div class="login-right">
        <div class="login-header">
          <div class="login-icon">
            <i class="fas fa-fingerprint"></i>
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Ingrese sus credenciales para acceder</p>
        </div>

        <div class="form-group">
          <label for="username">Usuario</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input
              v-model="email"
              type="text"
              id="username"
              class="form-control"
              placeholder="Ingrese su usuario"
              autocomplete="username"
            />
          </div>
          <div class="error-message" id="username-error">
            Este campo es requerido
          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              v-model="password"
              type="password"
              id="password"
              class="form-control"
              placeholder="Ingrese su contraseña"
              autocomplete="current-password"
            />
          </div>
          <div class="error-message" id="password-error">
            Este campo es requerido
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" id="remember" />
            <span>Recordarme</span>
          </label>
          <a href="#" class="forgot-password">¿Olvidó su contraseña?</a>
        </div>

        <button class="btn-login" id="btn-login" type="submit">
          <span class="btn-text">Iniciar Sesión</span>
          <div class="spinner"></div>
        </button>

        <div class="login-footer">
          <p>&copy; 2025 UGEL Sucre - Sistema de Control de Asistencia</p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { authService } from "@/api";
import Swal from "sweetalert2";

const email = ref("");
const password = ref("");
const isLoading = ref(false); // Add loading state
const errorMessage = ref(""); // Add error state

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await authService.login({
      correo_electronico: email.value,
      contrasena: password.value,
    });

    if (response.data.success && response.data.token) {
      const user = response.data.user;

      localStorage.setItem("token", response.data.token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Show success alert
      await Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#27ae60",
      });

      // Redirect based on role
      const roleName = user?.rol?.nombre?.toUpperCase() || "";
      if (roleName === "EMPLEADO") {
        window.location.href = "/mis-asistencias";
      } else if (roleName === "SUPERVISOR") {
        window.location.href = "/supervisor/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      // Handle explicit failure in response
      errorMessage.value = response.data.message || "Error desconocido";
      Swal.fire({
        icon: "error",
        title: "Error de Acceso",
        text: errorMessage.value,
        confirmButtonColor: "#e74c3c",
      });
    }
  } catch (error: any) {
    console.error("Login failed", error);
    errorMessage.value =
      error.response?.data?.message || "Usuario o contraseña incorrectos";

    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage.value,
      confirmButtonColor: "#e74c3c",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
:root {
  --primary: #2c3e50;
  --secondary: #3498db;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
  --light: #ecf0f1;
  --dark: #34495e;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  animation: slideIn 0.5s ease-out;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
}

.login-left::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=1000&fit=crop");
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.login-left-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.login-left-content img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.login-left-content h2 {
  font-size: 2rem;
  margin-top: 30px;
  margin-bottom: 15px;
}

.login-left-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

.login-right {
  flex: 1;
  padding: 60px 50px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: 40px;
}

.login-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.login-icon i {
  font-size: 2rem;
  color: white;
}

.login-header h1 {
  font-size: 1.8rem;
  color: var(--primary);
  margin-bottom: 10px;
  text-align: center;
}

.login-header p {
  font-size: 0.95rem;
  color: #7f8c8d;
  text-align: center;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--dark);
  font-weight: 600;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 1.1rem;
}

.form-control {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.form-control:focus {
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control.error {
  border-color: var(--danger);
}

.error-message {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 5px;
  display: none;
}

.error-message.show {
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--secondary);
}

.forgot-password {
  color: var(--secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: var(--primary);
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(52, 152, 219, 0.3);
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login.loading {
  pointer-events: none;
  opacity: 0.7;
}

.spinner {
  display: none;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-login.loading .spinner {
  display: block;
}

.btn-login.loading .btn-text {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: none;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert.show {
  display: flex;
}

.alert-danger {
  background-color: #ffebee;
  color: var(--danger);
  border-left: 4px solid var(--danger);
}

.alert-success {
  background-color: #e8f5e9;
  color: var(--success);
  border-left: 4px solid var(--success);
}

.alert i {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 30px;
    min-height: 300px;
  }

  .login-left-content h2 {
    font-size: 1.5rem;
  }

  .login-left-content p {
    font-size: 1rem;
  }

  .login-right {
    padding: 40px 30px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    border-radius: 15px;
  }

  .login-left {
    padding: 30px 20px;
  }

  .login-right {
    padding: 30px 20px;
  }

  .form-options {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>
