const workshop = {
  whatsapp: "",
  address: ""
};

const products = [
  { id: "bolsas", name: "Bolsas", description: "Bolsas de tela para llevar, regalar o personalizar con tu logo." },
  { id: "neceseres", name: "Neceseres", description: "Estuches para llevar tus artículos personales, con la tela y el acabado que elijas." },
  { id: "cartucheras", name: "Cartucheras", description: "Estuches para útiles o accesorios, con colores y diseño a pedido." },
  { id: "morrales", name: "Morrales", description: "Bolsos de tela con correa para llevar al hombro o cruzados." },
  { id: "mandiles", name: "Mandiles", description: "Mandiles para cocina, taller o negocio, con opción de personalizarlos." },
  { id: "estampados", name: "Estampados", description: "Tu diseño sobre tela. Consulta por estampado, serigrafía o sublimado." }
];

const photos = [
  { category: "bolsas", file: "bolsa-gato", title: "Bolsa de tela con diseño de gato", description: "Bolsa color crema con asas tejidas y un estampado negro." },
  { category: "neceseres", file: "neceseres-acolchados", title: "Neceseres acolchados", description: "Tres modelos en tonos pastel con costuras y acabados distintos." },
  { category: "mandiles", file: "mandil-peru", title: "Mandil con escudo del Perú", description: "Mandil negro con ribetes y tiras rojas." },
  { category: "estampados", file: "estampados-bolsas", title: "Estampados ilustrados y fotográficos", description: "Dos diseños distintos aplicados sobre bolsas de tela." },
  { category: "bolsas", file: "bolsa-yute", title: "Bolsa de yute con logo", description: "Bolsa estructurada de trama gruesa con un diseño en azul." },
  { category: "bolsas", file: "bolsa-raso", title: "Bolsita de raso con flores", description: "Raso plateado con estampado floral y cinta dorada." },
  { category: "bolsas", file: "bolsa-cordon", title: "Bolsa estampada con cordón", description: "Bolsa de tela clara con motivos de temporada y cierre de cordón." },
  { category: "cartucheras", file: "cartucheras" },
  { category: "morrales", file: "morrales" }
];

const form = document.querySelector("#quote-form");
const fields = form.elements;
const filters = document.querySelector("#filters");
const cards = document.querySelector("#cards");
const message = document.querySelector("#message");
const messagePreview = document.querySelector("#message-preview");
const messageStatus = document.querySelector("#message-status");
const whatsappReady = /^[1-9]\d{7,14}$/.test(workshop.whatsapp);

function showCategory(category) {
  for (const button of filters.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  }
  let count = 0;
  for (const card of cards.children) {
    card.hidden = category !== "todos" && card.dataset.category !== category;
    if (!card.hidden) count++;
  }
  document.querySelector("#results").textContent = count === 1 ? "1 ejemplo visible" : count + " ejemplos visibles";
}

for (const category of [{ id: "todos", name: "Todas" }, ...products]) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.category = category.id;
  button.textContent = category.name;
  button.addEventListener("click", () => showCategory(category.id));
  filters.append(button);
}

for (const product of products) {
  fields.producto.add(new Option(product.name, product.name));
}

for (const photo of photos) {
  const product = products.find(item => item.id === photo.category);
  const title = photo.title ?? product.name;
  const description = photo.description ?? product.description;
  const label = photo.title ? "Trabajo del taller" : "Imagen referencial";
  const card = document.createElement("article");
  card.className = "card";
  if (photo.title) card.classList.add("work-photo");
  card.dataset.category = product.id;
  card.innerHTML = `<div class="card-image"><img src="assets/${photo.file}.jpg" alt="" width="512" height="512" loading="lazy"><small>${label}</small></div><div class="card-body"><h3>${title}</h3><p>${description}</p><a href="#cotizar" aria-label="Cotizar: ${title}">Cotizar <span aria-hidden="true">↗</span></a></div>`;
  card.querySelector("a").addEventListener("click", () => {
    fields.producto.value = product.name;
    messagePreview.hidden = true;
  });
  cards.append(card);
}
fields.producto.add(new Option("Otro proyecto", "Otro proyecto"));
showCategory("todos");

for (const link of document.querySelectorAll("[data-tech]")) {
  link.addEventListener("click", () => {
    fields.tecnica.value = link.dataset.tech;
    messagePreview.hidden = true;
  });
}

if (workshop.address) {
  document.querySelector("#address").textContent = workshop.address;
  const directions = document.querySelector("#directions");
  const route = new URL("https://www.google.com/maps/dir/");
  route.searchParams.set("api", "1");
  route.searchParams.set("destination", workshop.address);
  directions.href = route.href;
  directions.hidden = false;
  document.querySelector(".map-art span").textContent = "Ilustración del recorrido";
}

document.querySelector("#form-help").textContent = whatsappReady
  ? "Revisa tu mensaje en WhatsApp antes de enviarlo."
  : "Modo de prueba. Puedes preparar y copiar el mensaje mientras se confirma el número del taller.";
if (!whatsappReady) document.querySelector("#submit-label").textContent = "Preparar mensaje de WhatsApp";

fields.nombre.addEventListener("input", () => fields.nombre.setCustomValidity(""));
form.addEventListener("input", event => {
  if (event.target.name) messagePreview.hidden = true;
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("nombre").trim();
  if (!name) {
    fields.nombre.setCustomValidity("Escribe tu nombre.");
    fields.nombre.reportValidity();
    return;
  }
  const lines = [
    "¡Hola! Soy " + name + " y quisiera una cotización.",
    "",
    "Producto: " + data.get("producto"),
    "Material: " + data.get("material"),
    "Personalización: " + data.get("tecnica"),
    "Cantidad: " + data.get("cantidad") + " unidades"
  ];
  if (data.get("fecha")) {
    const [year, month, day] = data.get("fecha").split("-");
    lines.push("Fecha deseada: " + day + "/" + month + "/" + year);
  }
  const details = data.get("detalle").trim();
  if (details) lines.push("Detalles: " + details);
  message.value = lines.join("\n");

  if (whatsappReady) {
    window.location.assign("https://wa.me/" + workshop.whatsapp + "?text=" + encodeURIComponent(message.value));
    return;
  }
  messageStatus.textContent = "Tu mensaje está listo para revisar.";
  messagePreview.hidden = false;
  message.focus();
});

document.querySelector("#copy-message").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    messageStatus.textContent = "Mensaje copiado.";
  } catch {
    message.focus();
    message.select();
    messageStatus.textContent = "El mensaje está seleccionado para que puedas copiarlo.";
  }
});
