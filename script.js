let map;
let userMarker;
let selectedCharger = null;
let markers = [];

document.addEventListener("DOMContentLoaded", function () {
    map = L.map("map").setView([40.4168, -3.7038], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    loadChargers();
});

function startApp() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("mapSection").classList.remove("hidden");
}

let cargadores = [
    { id: 1, lat: 40.4168, lng: -3.7038, tipo: "rápido", estado: "libre" },
    { id: 2, lat: 40.4175, lng: -3.7020, tipo: "estándar", estado: "ocupado" },
    { id: 3, lat: 40.4180, lng: -3.7050, tipo: "rápido", estado: "libre" }
];

function loadChargers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    cargadores.forEach(cargador => {
        let marker = L.marker([cargador.lat, cargador.lng]).addTo(map);
        marker.bindPopup(`<b>Cargador ${cargador.id}</b><br>Tipo: ${cargador.tipo}<br>Estado: ${cargador.estado}`);
        marker.on("click", () => selectCharger(cargador));
        markers.push(marker);
    });
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            map.setView([lat, lng], 14);

            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.marker([lat, lng]).addTo(map).bindPopup("Tu Ubicación").openPopup();
        });
    } else {
        alert("Geolocalización no soportada.");
    }
}

function selectCharger(cargador) {
    selectedCharger = cargador;
    document.getElementById("chargerDetails").innerHTML = `
        <b>Cargador ${cargador.id}</b><br>
        Tipo: ${cargador.tipo}<br>
        Estado: ${cargador.estado}
    `;
}

function reserveCharger() {
    if (!selectedCharger) {
        alert("Selecciona un cargador primero.");
        return;
    }
    if (selectedCharger.estado !== "libre") {
        alert("Este cargador no está disponible.");
        return;
    }
    selectedCharger.estado = "reservado";
    alert(`Cargador ${selectedCharger.id} reservado.`);
    document.getElementById("chargerDetails").innerHTML += "<br>Estado: Reservado";
    loadChargers(); // Recarga el mapa con los cambios.
}

function filterChargers() {
    let selectedType = document.getElementById("filter").value;
    cargadores = cargadores.map(c => {
        return (selectedType === "todos" || c.tipo === selectedType) ? c : { ...c, estado: "filtrado" };
    });
    loadChargers();
}
