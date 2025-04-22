let users = {}; // Simula una base de datos de usuarios
let currentUser = null;
let currentUserRole = null;
let userReservations = [];
let map;
let markers = [];
let cargadores = [
    { id: 1, lat: 40.4168, lng: -3.7038, tipo: "rápido", estado: "libre", nivelBateria: "80%" },
    { id: 2, lat: 40.4175, lng: -3.7020, tipo: "estándar", estado: "ocupado", nivelBateria: "50%" },
    { id: 3, lat: 40.4190, lng: -3.7045, tipo: "compatible", estado: "libre", nivelBateria: "90%" },
];

// Variables para la reserva
let selectedCharger = null;

document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    profileButton.addEventListener("click", () => {
        profileDropdown.classList.toggle("hidden");
    });

    // Cargar credenciales guardadas
    loadSavedCredentials();
});

function loadSavedCredentials() {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedUsername && savedPassword) {
        document.getElementById("username").value = savedUsername;
        document.getElementById("password").value = savedPassword;
    }
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorElement = document.getElementById("loginError");

    if (!username || !password) {
        errorElement.textContent = "Por favor, ingresa un nombre de usuario y contraseña.";
        return;
    }

    if (!users[username] || users[username] !== password) {
        errorElement.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    // Guardar credenciales en localStorage
    currentUser = { username, password };
    currentUserRole = "usuario"; // Por defecto, el rol es "usuario"
    document.getElementById("profileName").textContent = `Usuario: ${username}`;
    startApp();
}

function register() {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorElement = document.getElementById("registerError");

    if (!username || !password || !confirmPassword) {
        errorElement.textContent = "Por favor, completa todos los campos.";
        return;
    }

    if (users[username]) {
        errorElement.textContent = "El nombre de usuario ya existe.";
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = "Las contraseñas no coinciden.";
        return;
    }

    users[username] = password;
    alert("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
    document.getElementById("register").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
}

function startApp() {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("profileMenu").classList.remove("hidden");
    document.getElementById("mapSection").classList.remove("hidden");
    initializeMap();
}

function initializeMap() {
    if (!map) {
        map = L.map("map").setView([40.4168, -3.7038], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);
    }
    loadChargers();
}

function loadChargers() {
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    cargadores.forEach((c) => {
        let marker = L.marker([c.lat, c.lng])
            .addTo(map)
            .bindPopup(
                `⚡ Cargador ${c.id} (${c.tipo}) - Estado: ${c.estado} - Batería: ${c.nivelBateria}
                <br><button onclick="reserveCharger(${c.id})">🔋 Reservar</button>`
            );
        markers.push(marker);
    });
}

function reserveCharger(id) {
    const charger = cargadores.find((c) => c.id === id);

    if (charger && charger.estado === "libre") {
        selectedCharger = charger;

        // Mostrar el modal de reserva
        const reservationModal = document.getElementById("reservationModal");
        if (reservationModal) {
            reservationModal.classList.remove("hidden");
        } else {
            console.error("No se encontró el elemento con ID 'reservationModal'.");
        }
    } else {
        alert("❌ Este cargador no está disponible.");
    }
}

function closeReservationModal() {
    document.getElementById("reservationModal").classList.add("hidden");
}

function simulatePayment() {
    const time = parseInt(document.getElementById("reservationTime").value, 10);
    if (time < 1 || time > 2) {
        alert("El tiempo debe estar entre 1 y 2 horas.");
        return;
    }

    const cost = time * 0.5; // Precio fijo de 0.5 €/kWh
    const summary = `
        Cargador: ${selectedCharger.id} (${selectedCharger.tipo})<br>
        Tiempo de uso: ${time} horas<br>
        Costo estimado: ${cost.toFixed(2)} €<br>
    `;

    document.getElementById("paymentSummary").innerHTML = summary;
    document.getElementById("reservationModal").classList.add("hidden");
    document.getElementById("paymentSummaryModal").classList.remove("hidden");
}

function closePaymentSummaryModal() {
    document.getElementById("paymentSummaryModal").classList.add("hidden");
}

function confirmReservation() {
    const time = parseInt(document.getElementById("reservationTime").value, 10);
    selectedCharger.estado = "ocupado";
    userReservations.push({
        id: selectedCharger.id,
        time: new Date(),
        duration: time,
        cost: time * 0.5,
    });

    alert(`✅ Has reservado el cargador ${selectedCharger.id} por ${time} horas.`);
    document.getElementById("paymentSummaryModal").classList.add("hidden");
    loadChargers();
}

function logout() {
    currentUser = null;
    currentUserRole = null;
    document.getElementById("profileMenu").classList.add("hidden");
    document.getElementById("mapSection").classList.add("hidden");
    document.getElementById("loginOptions").classList.remove("hidden");
}

function showReservationHistory() {
    const reservationHistory = document.getElementById("reservationHistory");
    const reservationList = document.getElementById("reservationList");

    reservationList.innerHTML = userReservations.length
        ? userReservations.map((r) => `<li>Reserva: ${r.id} - ${r.time.toLocaleString()}</li>`).join("")
        : "<li>No tienes reservas.</li>";

    reservationHistory.classList.remove("hidden");
}

function closeReservationHistory() {
    document.getElementById("reservationHistory").classList.add("hidden");
}

function changePassword() {
    const newPassword = prompt("Ingresa tu nueva contraseña:");
    if (newPassword) {
        users[currentUser.username] = newPassword;
        alert("Contraseña actualizada con éxito.");
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
}

function showLoginForm() {
    document.getElementById("loginOptions").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
}

function showRegisterForm() {
    document.getElementById("loginOptions").classList.add("hidden");
    document.getElementById("register").classList.remove("hidden");
}


//hola gpt eres capaz de ver este cambio?
