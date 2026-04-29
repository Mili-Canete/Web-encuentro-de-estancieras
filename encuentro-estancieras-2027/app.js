let page = "home";

const backgrounds = [
  "img/dunasnihuil.webp",
  "img/nihuil.jfif",
  "img/tigre.jpg",
  "img/canonatuel.avif",
  "img/reyunos.jpg"
];

let bgIndex = 0;

setInterval(() => {
  document.getElementById("app").style.backgroundImage =
    `url(${backgrounds[bgIndex]})`;

  bgIndex = (bgIndex + 1) % backgrounds.length;
}, 30000);

// navegación
function goPage(p) {
  const targetPage = document.getElementById(p);
  
  // Si la página no existe en el HTML, salimos de la función sin tirar error
  if (!targetPage) return; 

  // Quitamos la clase 'active' de todas las páginas
  document.querySelectorAll(".page").forEach(e => e.classList.remove("active"));
  
  // Agregamos 'active' a la página que encontramos
  targetPage.classList.add("active");

  // Si es la página de clima, ejecutamos la función de la API
  if (p === 'weather') {
    getWeather();
  }
}

// storage
let inscriptos = JSON.parse(localStorage.getItem("inscriptos")) || [];

// inscripción
function saveInscription() {
  // Obtener valores correctamente
  const nombre = document.getElementById("nombre").value;
  const ciudad = document.getElementById("ciudad").value;
  const provincia = document.getElementById("provincia").value;
  const celular = document.getElementById("celular").value;
  const vehiculo = document.getElementById("vehiculo").value;
  const personas = document.getElementById("personas").value;

  if(!nombre) return alert("Por favor, poné un nombre");

  const data = {
    nombre, ciudad, provincia, celular, vehiculo,
    personas: Number(personas) || 0
  };

  inscriptos.push(data);
  localStorage.setItem("inscriptos", JSON.stringify(inscriptos));

  alert("¡Inscripción guardada con éxito!");
  updateTotal();
  
  // Limpiar campos
  document.querySelectorAll("#register input").forEach(i => i.value = "");
}


// total personas
function updateTotal() {
  let total = inscriptos.reduce((a,b) => a + (b.personas || 0), 0);
  // El total de vehículos es la cantidad de registros en la lista
  let totalVehiculos = inscriptos.length;

  document.getElementById("total-vehiculos").innerText = "Total vehículos: " + totalVehiculos;
  document.getElementById("total").innerText = "Total personas: " + total;
}


// export excel inscriptos
function exportInscripciones() {
  const ws = XLSX.utils.json_to_sheet(inscriptos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscripciones");
  XLSX.writeFile(wb, "inscriptos.xlsx");
}

// export alojamientos
function exportAlojamientos() {
  const ws = XLSX.utils.json_to_sheet(alojamientos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alojamientos");
  XLSX.writeFile(wb, "alojamientos.xlsx");
}

// init
updateTotal();

async function getWeather() {

  const container = document.getElementById("weather-data");

  const city = "San Rafael,AR";
  const apiKey = "1799b06e82ec55770619ed0837c2467a"; // Necesitás registrarte en openweathermap.org
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

  // Mensaje de carga con estilo
  container.innerHTML = "<p>Consultando el cielo de San Rafael...</p>";

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`);
    
    if (response.status === 401) {
      container.innerHTML = `
        <p style="color: #ffcc00;">⚠️ API en proceso de activación</p>
        <p style="font-size: 0.9em;">OpenWeather tarda un rato en habilitar llaves nuevas. <br> Intentá de nuevo en unos minutos.</p>
      `;
      return;
    }

    if (!response.ok) throw new Error("Error en el pedido");

    const data = await response.json();
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    container.innerHTML = `
      <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-top: 20px;">
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="clima">
        <h2 style="font-size: 48px; margin: 0;">${temp}°C</h2>
        <p style="text-transform: capitalize; font-size: 20px; opacity: 0.9;">${desc}</p>
        <p style="font-size: 14px; margin-top: 10px;">📍 San Rafael, Mendoza</p>
      </div>
    `;
  } catch (error) {
    container.innerHTML = "<p>No se pudo conectar con el servicio. Verificá tu conexión.</p>";
  }
}

// Llamar a la función cuando el usuario entre a la página de clima
function goPage(p) {
  document.querySelectorAll(".page").forEach(e => e.classList.remove("active"));
  document.getElementById(p).classList.add("active");
  
  if(p === 'weather') {
    getWeather();
  }
}