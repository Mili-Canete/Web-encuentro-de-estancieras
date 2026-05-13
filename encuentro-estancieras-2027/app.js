const firebaseConfig = {
    apiKey: "AIzaSyCYUUQEQPxOdlVAzskLdlWAQmAxHgOVA9I",
    authDomain: "estancieras2027.firebaseapp.com",
    databaseURL: "https://estancieras2027-default-rtdb.firebaseio.com",
    projectId: "estancieras2027",
    storageBucket: "estancieras2027.firebasestorage.app",
    messagingSenderId: "647308593690",
    appId: "1:647308593690:web:9df9c8aa35b4cc8ffd1fa3",
    measurementId: "G-FP7DS4BNN5"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

let fotoBase64 = "";

// Escuchar cuando se selecciona una foto
document.getElementById('fotoVehiculo').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
    fotoBase64 = reader.result; // Aquí se guarda la imagen como texto
    document.getElementById('imgPreview').src = fotoBase64;
    document.getElementById('preview').style.display = "block";
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

// inscripción
function saveInscription() {
  // 1. Obtener los elementos del DOM
  const nombreInput = document.getElementById("nombre");
  const ciudadInput = document.getElementById("ciudad");
  const provinciaInput = document.getElementById("provincia");
  const celularInput = document.getElementById("celular");
  const vehiculoInput = document.getElementById("vehiculo");
  const personasInput = document.getElementById("personas");
  const fotoInput = document.getElementById("fotoVehiculo");

  // 2. Validaciones básicas
  if (!nombreInput.value.trim()) {
    return alert("Por favor, poné un nombre y apellido.");
  }

  // 3. Crear el objeto de datos
  const nuevaInscripcion = {
    nombre: nombreInput.value,
    ciudad: ciudadInput.value,
    provincia: provinciaInput.value,
    celular: celularInput.value,
    vehiculo: vehiculoInput.value,
    personas: Number(personasInput.value) || 0,
    foto: fotoBase64, // Esta variable global se actualiza con el evento 'change' del input file
    fecha: new Date().toLocaleString() // Para saber cuando se anotó
  };

  // GUARDAR EN FIREBASE
  database.ref('inscriptos').push(nuevaInscripcion)
    .then(() => {
      alert("¡Inscripción enviada a la base de datos!");
      limpiarCampos(); // Función para resetear los inputs
    })
    .catch((error) => {
      console.error("Error al guardar:", error);
      alert("Hubo un error al conectar con Firebase");
    });

  // 5. Feedback y actualización de la UI
  alert("¡Inscripción guardada con éxito!");
  updateTotal(); // Esta función ahora actualiza personas y vehículos

  // 6. Limpieza completa de los campos
  function limpiarCampos() {
    nombreInput.value = "";
    ciudadInput.value = "";
    provinciaInput.value = "";
    celularInput.value = "";
    vehiculoInput.value = "";
    personasInput.value = "";
    fotoInput.value = ""; // Limpia el selector de archivos
  
    // Limpiar la variable de la foto y ocultar el preview
    fotoBase64 = "";
    const previewDiv = document.getElementById('preview');
    if (previewDiv) {
      previewDiv.style.display = "none";
      document.getElementById('imgPreview').src = "";
    }

}
}


// total personas
function updateTotal() {
  let total = inscriptos.reduce((a,b) => a + (b.personas || 0), 0);
  // El total de vehículos es la cantidad de registros en la lista
  let totalVehiculos = inscriptos.length;

  document.getElementById("total-vehiculos").innerText = "Total vehículos: " + totalVehiculos;
  document.getElementById("total").innerText = "Total personas: " + total;
}

// export alojamientos
function exportAlojamientos() {
  const ws = XLSX.utils.json_to_sheet(alojamientos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alojamientos");
  XLSX.writeFile(wb, "alojamientos.xlsx");
}

// init
//updateTotal();

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

// Configuración de Admin
const ADMIN_PASSWORD = "Tortuga02";

function checkAdmin() {
    const pass = document.getElementById("adminPass").value;
    if (pass === ADMIN_PASSWORD) {
        document.getElementById("admin-auth").style.display = "none";
        document.getElementById("admin-content").style.display = "block";
        cargarDatosAdmin();
    } else {
        alert("Contraseña incorrecta");
    }
}

function cargarDatosAdmin() {
    const tabla = document.getElementById("lista-admin");
    
    // El método .on('value') de Firebase es genial: 
    // Si alguien se inscribe en su casa, la tabla se actualiza sola en tu pantalla
    database.ref('inscriptos').on('value', (snapshot) => {
        tabla.innerHTML = ""; // Limpiamos para no duplicar
        const datos = snapshot.val();

        for (let id in datos) {
            const i = datos[id];
            const row = `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td>
                        <img src="${i.foto || ''}" 
                            onclick="verFoto('${i.foto}')" 
                            style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; cursor: zoom-in;" 
                            alt="Miniatura">
                    </td>
                    <td>${i.nombre}</td>
                    <td>${i.vehiculo}</td>
                    <td>${i.ciudad}, ${i.provincia}</td>
                    <td>${i.celular}</td>
                    <td>${i.personas}</td>
                    <td>
                        <button onclick="eliminarInscripcion('${id}')" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += row;
        }
    });
}

function verFoto(url) {
    if (!url) return alert("Esta inscripción no tiene foto.");
    
    const modal = document.getElementById("fotoModal");
    const img = document.getElementById("fotoGrande");
    
    img.src = url;
    modal.style.display = "flex"; // Usamos flex para centrar la imagen
}

function cerrarFoto() {
    document.getElementById("fotoModal").style.display = "none";
}

// Opcional: Cerrar el modal si el usuario presiona la tecla 'Esc'
window.onkeydown = function(event) {
    if (event.key === "Escape") {
        cerrarFoto();
    }
}

function eliminarInscripcion(id) {
    if (confirm("¿Estás segura de que querés eliminar esta inscripción? Esta acción no se puede deshacer.")) {
        database.ref('inscriptos/' + id).remove()
            .then(() => {
                alert("Inscripción eliminada correctamente.");
                // No hace falta recargar, el .on('value') actualiza la tabla solo
            })
            .catch((error) => {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el registro.");
            });
    }
}

// Función para escuchar cambios en Firebase y actualizar contadores
function escucharInscripciones() {
    database.ref('inscriptos').on('value', (snapshot) => {
        const datos = snapshot.val();
        let totalPersonas = 0;
        let totalVehiculos = 0;

        if (datos) {
            // Convertimos el objeto en un array para usar reduce o contar
            const lista = Object.values(datos);
            totalVehiculos = lista.length;
            totalPersonas = lista.reduce((acc, curr) => { 
            const cantidad = Number(curr.personas) || 0;
            return acc + cantidad;   
            }, 0);
        
          }
        // Actualizamos los elementos del HTML (tanto en el registro como en el home si los tenés)
        const elTotalPersonas = document.getElementById("total");
        const elTotalVehiculos = document.getElementById("total-vehiculos");

        if (elTotalPersonas) elTotalPersonas.innerText = "Total personas: " + totalPersonas;
        if (elTotalVehiculos) elTotalVehiculos.innerText = "Total vehículos: " + totalVehiculos;
        
        console.log("Contadores actualizados en tiempo real");
    });
}

escucharInscripciones();