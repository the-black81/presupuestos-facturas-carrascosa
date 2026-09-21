/* ============================================================
    app.js - Lógica Principal, Clientes, Logos, Numeración y Exportación
   ============================================================ */

let items = [{ cant: "1", unid: "", desc: "", precio: 0.00 }];
let galeriaLogos = JSON.parse(localStorage.getItem("carrascosa_logos") || "[]");
let clientesGuardados = JSON.parse(localStorage.getItem("carrascosa_clientes") || "[]");
let historialDocumentos = JSON.parse(localStorage.getItem("carrascosa_historial") || "[]");

// Forzamos un mínimo de 1 para evitar que empiece en 000
let numPresupuesto = Math.max(1, parseInt(localStorage.getItem("carrascosa_seq_pres") || "1", 10));
let numFactura = Math.max(1, parseInt(localStorage.getItem("carrascosa_seq_fact") || "1", 10));

function obtenerFechaHoyISO() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${anio}-${mes}-${dia}`;
}

function formatearFechaEspanol(fechaISO) {
    if (!fechaISO) return "";
    const partes = fechaISO.split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaISO;
}

function formatearNumero(prefijo, numero) {
    const anio = new Date().getFullYear();
    return `${prefijo}-${anio}-${String(Math.max(1, numero)).padStart(3, '0')}`;
}

function inicializarNumeracion() {
    const tipoElem = document.getElementById("tipoDoc");
    if (!tipoElem) return;
    const tipo = tipoElem.value;
    
    const numDocElem = document.getElementById("numDoc");
    if (numDocElem && (!numDocElem.value || numDocElem.value.includes("000"))) {
        if (tipo === "PRESUPUESTO") {
            numDocElem.value = formatearNumero("PRES", numPresupuesto);
        } else {
            numDocElem.value = formatearNumero("FACT", numFactura);
        }
    }
    
    const inputFecha = document.getElementById("fechaDoc");
    if (inputFecha && !inputFecha.value) {
        inputFecha.value = obtenerFechaHoyISO();
    }
    actualizarBotonToggle();
    actualizar();
}

function cambiarTipoDocUI() {
    const tipoElem = document.getElementById("tipoDoc");
    if (!tipoElem) return;
    const numDocElem = document.getElementById("numDoc");
    
    if (tipoElem.value === "PRESUPUESTO") {
        numDocElem.value = formatearNumero("PRES", numPresupuesto);
    } else {
        numDocElem.value = formatearNumero("FACT", numFactura);
    }
    actualizarBotonToggle();
    actualizar();
}

function alternarTipoDocumento() {
    const selectTipo = document.getElementById("tipoDoc");
    if (!selectTipo) return;
    if (selectTipo.value === "PRESUPUESTO") {
        selectTipo.value = "FACTURA";
    } else {
        selectTipo.value = "PRESUPUESTO";
    }
    cambiarTipoDocUI();
}

function actualizarBotonToggle() {
    const tipoElem = document.getElementById("tipoDoc");
    const btn = document.getElementById("btnToggleDoc");
    if (!btn || !tipoElem) return;
    
    if (tipoElem.value === "PRESUPUESTO") {
        btn.innerText = "🔄 Cambiar a FACTURA";
        btn.style.background = "#7c3aed";
    } else {
        btn.innerText = "🔄 Cambiar a PRESUPUESTO";
        btn.style.background = "#0d9488";
    }
}

function detectarNumeroManualYCargar() {
    const numDocElem = document.getElementById("numDoc");
    if (!numDocElem) return;
    const valorInput = numDocElem.value.trim().toUpperCase();
    if (!valorInput) return;

    const coincidencia = historialDocumentos.find(doc => {
        if (!doc.numDoc) return false;
        if (doc.numDoc.toUpperCase() === valorInput) return true;
        const partes = doc.numDoc.split("-");
        if (partes.length > 0 && parseInt(partes[partes.length - 1], 10) === parseInt(valorInput, 10)) {
            return true;
        }
        return false;
    });

    if (coincidencia) {
        cargarDatosDesdeObjeto(coincidencia);
    } else {
        const coincidenciasNum = valorInput.match(/\d+/g);
        if (coincidenciasNum && coincidenciasNum.length > 0) {
            const ultimoNum = parseInt(coincidenciasNum[coincidenciasNum.length - 1], 10);
            const tipoElem = document.getElementById("tipoDoc");
            const tipo = tipoElem ? tipoElem.value : "PRESUPUESTO";
            if (tipo === "PRESUPUESTO") {
                numPresupuesto = ultimoNum;
                localStorage.setItem("carrascosa_seq_pres", numPresupuesto);
            } else {
                numFactura = ultimoNum;
                localStorage.setItem("carrascosa_seq_fact", numFactura);
            }
        }
        actualizar();
    }
}

function guardarEnHistorial(silencioso = false) {
    const numDocElem = document.getElementById("numDoc");
    if (!numDocElem || !numDocElem.value.trim()) return;

    const docActual = {
        numDoc: numDocElem.value,
        tipoDoc: document.getElementById("tipoDoc")?.value || "PRESUPUESTO",
        fechaDoc: document.getElementById("fechaDoc")?.value || obtenerFechaHoyISO(),
        validezDoc: document.getElementById("validezDoc")?.value || "30 Días",
        cliNombre: document.getElementById("cliNombre")?.value || "",
        cliDir: document.getElementById("cliDir")?.value || "",
        cliTel: document.getElementById("cliTel")?.value || "",
        cliNif: document.getElementById("cliNif")?.value || "",
        cliEmail: document.getElementById("cliEmail")?.value || "",
        txtProyecto: document.getElementById("txtProyecto")?.value || "",
        items: JSON.parse(JSON.stringify(items)),
        tipoIva: document.getElementById("tipoIva")?.value || "10",
        txtConceptoBancario: document.getElementById("txtConceptoBancario")?.value || "",
        chkManoObra: document.getElementById("chkManoObra") ? document.getElementById("chkManoObra").checked : true,
        chkFormaPago: document.getElementById("chkFormaPago") ? document.getElementById("chkFormaPago").checked : true
    };

    const idx = historialDocumentos.findIndex(d => d.numDoc === docActual.numDoc);
    if (idx >= 0) {
        historialDocumentos[idx] = docActual;
    } else {
        historialDocumentos.push(docActual);
    }

    localStorage.setItem("carrascosa_historial", JSON.stringify(historialDocumentos));
    cargarDesplegableHistorial();
    if (silencioso) alert(`Documento ${docActual.numDoc} guardado en memoria con éxito.`);
}

function cargarDesplegableHistorial() {
    const select = document.getElementById("selectHistorial");
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar de la Memoria --</option>';
    historialDocumentos.forEach((doc, index) => {
        const fechaTexto = formatearFechaEspanol(doc.fechaDoc) || doc.fechaDoc;
        select.innerHTML += `<option value="${index}">${doc.numDoc} - ${doc.cliNombre || 'Sin Cliente'} (${fechaTexto})</option>`;
    });
}

function cargarDocumentoDesdeHistorial() {
    const select = document.getElementById("selectHistorial");
    if (!select) return;
    const idx = select.value;
    if (idx !== "" && historialDocumentos[idx]) {
        cargarDatosDesdeObjeto(historialDocumentos[idx]);
    }
}

// CARGA UNIVERSAL (JSON / PDF)
function cargarDocumentoUniversal(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.historial && Array.isArray(data.historial) && data.historial.length > 0) {
                    cargarDatosDesdeObjeto(data.historial[data.historial.length - 1]);
                    alert("Copia cargada con éxito desde el backup.");
                } else if (data.numDoc) {
                    cargarDatosDesdeObjeto(data);
                    alert(`Documento ${data.numDoc} cargado correctamente para su modificación.`);
                } else {
                    alert("El archivo JSON no tiene un formato compatible de documento.");
                }
            } catch (err) {
                alert("Error al leer el archivo JSON.");
            }
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
        leerTextoPDFYModificar(file);
    } else {
        alert("Por favor, selecciona un archivo válido con extensión .json o .pdf");
    }
}

async function leerTextoPDFYModificar(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textoCompleto = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str);
            textoCompleto += textItems.join(" ") + "\n";
        }

        const matchNum = textoCompleto.match(/(PRES|FACT)-\d{4}-\d{3}/i);
        if (matchNum) {
            const numDetectado = matchNum[0].toUpperCase();
            document.getElementById("numDoc").value = numDetectado;
            if (numDetectado.startsWith("FACT")) {
                document.getElementById("tipoDoc").value = "FACTURA";
            } else {
                document.getElementById("tipoDoc").value = "PRESUPUESTO";
            }

            const enHistorial = historialDocumentos.find(d => d.numDoc === numDetectado);
            if (enHistorial) {
                cargarDatosDesdeObjeto(enHistorial);
                alert(`¡Documento ${numDetectado} encontrado en la memoria y cargado para modificar!`);
                return;
            }
        }

        alert("PDF leído correctamente. Número detectado, pero no estaba en la memoria local.");
        actualizar();

    } catch (error) {
        console.error("Error al leer el PDF:", error);
        alert("No se pudo leer el contenido del PDF.");
    }
}

function cargarDatosDesdeObjeto(doc) {
    if (!doc) return;
    if (document.getElementById("tipoDoc")) document.getElementById("tipoDoc").value = doc.tipoDoc || "PRESUPUESTO";
    if (document.getElementById("numDoc")) document.getElementById("numDoc").value = doc.numDoc || "";
    if (document.getElementById("fechaDoc")) document.getElementById("fechaDoc").value = doc.fechaDoc || obtenerFechaHoyISO();
    if (document.getElementById("validezDoc")) document.getElementById("validezDoc").value = doc.validezDoc || "30 Días";
    if (document.getElementById("cliNombre")) document.getElementById("cliNombre").value = doc.cliNombre || "";
    if (document.getElementById("cliDir")) document.getElementById("cliDir").value = doc.cliDir || "";
    if (document.getElementById("cliTel")) document.getElementById("cliTel").value = doc.cliTel || "";
    if (document.getElementById("cliNif")) document.getElementById("cliNif").value = doc.cliNif || "";
    if (document.getElementById("cliEmail")) document.getElementById("cliEmail").value = doc.cliEmail || "";
    if (document.getElementById("txtProyecto")) document.getElementById("txtProyecto").value = doc.txtProyecto || "";
    
    items = doc.items && doc.items.length ? JSON.parse(JSON.stringify(doc.items)) : [{ cant: "1", unid: "", desc: "", precio: 0 }];
    
    if (document.getElementById("tipoIva")) document.getElementById("tipoIva").value = doc.tipoIva || "10";
    if (document.getElementById("txtConceptoBancario")) document.getElementById("txtConceptoBancario").value = doc.txtConceptoBancario || "";
    if (document.getElementById("chkManoObra")) document.getElementById("chkManoObra").checked = doc.chkManoObra !== undefined ? doc.chkManoObra : true;
    if (document.getElementById("chkFormaPago")) document.getElementById("chkFormaPago").checked = doc.chkFormaPago !== undefined ? doc.chkFormaPago : true;

    renderItems();
    actualizarBotonToggle();
    actualizar();
}

function eliminarDocumentoActualDelHistorial() {
    const numDocElem = document.getElementById("numDoc");
    if (!numDocElem) return;
    const numDoc = numDocElem.value;
    const idx = historialDocumentos.findIndex(d => d.numDoc === numDoc);
    if (idx >= 0) {
        if (confirm(`¿Seguro que deseas eliminar ${numDoc} de la memoria?`)) {
            historialDocumentos.splice(idx, 1);
            localStorage.setItem("carrascosa_historial", JSON.stringify(historialDocumentos));
            cargarDesplegableHistorial();
            alert(`Documento ${numDoc} eliminado.`);
        }
    } else {
        alert("El documento actual no está guardado en el historial.");
    }
}

function descargarCopiaSeguridad() {
    const fechaActual = formatearFechaEspanol(obtenerFechaHoyISO()).replace(/\//g, '-');
    const backupData = {
        fechaBackup: fechaActual,
        numPresupuesto: numPresupuesto,
        numFactura: numFactura,
        historial: historialDocumentos,
        clientes: clientesGuardados,
        logos: galeriaLogos
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_Carrascosa_${fechaActual}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function restaurarCopiaSeguridad(event) {
    if (!event.target.files || !event.target.files[0]) return;
    const fileReader = new FileReader();
    fileReader.onload = function() {
        try {
            const data = JSON.parse(fileReader.result);
            if (data.historial && data.clientes) {
                historialDocumentos = data.historial;
                clientesGuardados = data.clientes;
                galeriaLogos = data.logos || [];
                numPresupuesto = Math.max(1, data.numPresupuesto || 1);
                numFactura = Math.max(1, data.numFactura || 1);

                localStorage.setItem("carrascosa_historial", JSON.stringify(historialDocumentos));
                localStorage.setItem("carrascosa_clientes", JSON.stringify(clientesGuardados));
                localStorage.setItem("carrascosa_logos", JSON.stringify(galeriaLogos));
                localStorage.setItem("carrascosa_seq_pres", numPresupuesto);
                localStorage.setItem("carrascosa_seq_fact", numFactura);

                cargarDesplegableHistorial();
                cargarDesplegableClientes();
                cargarDesplegableLogos();
                inicializarNumeracion();
                alert("Copia de seguridad restaurada correctamente.");
            } else {
                alert("El archivo subido no es una copia de seguridad válida.");
            }
        } catch (e) {
            alert("Error al procesar el archivo de copia de seguridad.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

function crearNuevoDocumentoCorrelativo() {
    guardarEnHistorial(false);
    const tipoElem = document.getElementById("tipoDoc");
    if (!tipoElem) return;
    const tipo = tipoElem.value;
    
    if (tipo === "PRESUPUESTO") {
        numPresupuesto++;
        localStorage.setItem("carrascosa_seq_pres", numPresupuesto);
        document.getElementById("numDoc").value = formatearNumero("PRES", numPresupuesto);
    } else {
        numFactura++;
        localStorage.setItem("carrascosa_seq_fact", numFactura);
        document.getElementById("numDoc").value = formatearNumero("FACT", numFactura);
    }
    limpiarFormularioCompleto();
    const fechaDoc = document.getElementById("fechaDoc");
    if (fechaDoc) fechaDoc.value = obtenerFechaHoyISO();
    actualizar();
}

function limpiarFormularioCompleto() {
    if (document.getElementById("selectCliente")) document.getElementById("selectCliente").value = "";
    if (document.getElementById("cliNombre")) document.getElementById("cliNombre").value = "";
    if (document.getElementById("cliDir")) document.getElementById("cliDir").value = "";
    if (document.getElementById("cliTel")) document.getElementById("cliTel").value = "";
    if (document.getElementById("cliNif")) document.getElementById("cliNif").value = "";
    if (document.getElementById("cliEmail")) document.getElementById("cliEmail").value = "";
    if (document.getElementById("txtProyecto")) document.getElementById("txtProyecto").value = "";
    items = [{ cant: "1", unid: "", desc: "", precio: 0.00 }];
    renderItems();
}

function resetearContadoresYBorrarTodo() {
    if (confirm("⚠️ ¿Estás seguro de hacer un reset completo? Se descargará una COPIA DE SEGURIDAD AUTOMÁTICA con todos los datos antes de borrar la memoria.")) {
        descargarCopiaSeguridad();
        setTimeout(() => {
            localStorage.clear();
            numPresupuesto = 1;
            numFactura = 1;
            historialDocumentos = [];
            clientesGuardados = [];
            galeriaLogos = [];
            cargarDesplegableHistorial();
            cargarDesplegableClientes();
            cargarDesplegableLogos();
            limpiarFormularioCompleto();
            inicializarNumeracion();
            alert("Reset completado. Se ha guardado el backup automático en tus descargas.");
        }, 1000);
    }
}

function guardarNuevoLogo(event) {
    if (!event.target.files || !event.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = function() {
        const base64Img = reader.result;
        const nombreLogo = `Logo ${galeriaLogos.length + 1}`;
        galeriaLogos.push({ nombre: nombreLogo, data: base64Img });
        localStorage.setItem("carrascosa_logos", JSON.stringify(galeriaLogos));
        cargarDesplegableLogos();
        aplicarLogoData(base64Img);
    };
    reader.readAsDataURL(event.target.files[0]);
}

function cargarDesplegableLogos() {
    const select = document.getElementById("selectLogo");
    if (!select) return;
    select.innerHTML = '<option value="">- Sin Logo / Texto -</option>';
    galeriaLogos.forEach((logo, index) => {
        select.innerHTML += `<option value="${index}">${logo.nombre}</option>`;
    });
}

function seleccionarLogoGuardado() {
    const select = document.getElementById("selectLogo");
    if (!select) return;
    const idx = select.value;
    const imgLogo = document.getElementById('imgLogo');
    const textLogoFallback = document.getElementById('textLogoFallback');

    if(idx !== "" && galeriaLogos[idx]) {
        aplicarLogoData(galeriaLogos[idx].data);
    } else {
        if (imgLogo) imgLogo.style.display = 'none';
        if (textLogoFallback) textLogoFallback.style.display = 'block';
    }
}

function aplicarLogoData(dataUri) {
    const img = document.getElementById('imgLogo');
    const textLogoFallback = document.getElementById('textLogoFallback');
    if (!img) return;
    img.src = dataUri;
    img.style.display = 'block';
    if (textLogoFallback) textLogoFallback.style.display = 'none';
}

function guardarClienteActual() {
    const cliNombreElem = document.getElementById("cliNombre");
    if (!cliNombreElem) return;
    const nombreCli = cliNombreElem.value.trim();
    if (!nombreCli) {
        alert("Por favor, introduce al menos un nombre para guardar el cliente.");
        return;
    }

    const cliente = {
        nombre: nombreCli,
        dir: document.getElementById("cliDir")?.value || "",
        tel: document.getElementById("cliTel")?.value || "",
        nif: document.getElementById("cliNif")?.value || "",
        email: document.getElementById("cliEmail")?.value || ""
    };
    
    const idxExistente = clientesGuardados.findIndex(c => c.nombre.toLowerCase() === cliente.nombre.toLowerCase());
    if(idxExistente >= 0) {
        clientesGuardados[idxExistente] = cliente;
    } else {
        clientesGuardados.push(cliente);
    }
    localStorage.setItem("carrascosa_clientes", JSON.stringify(clientesGuardados));
    cargarDesplegableClientes();
    alert("Cliente guardado en memoria con éxito.");
}

function cargarDesplegableClientes() {
    const select = document.getElementById("selectCliente");
    if (!select) return;
    select.innerHTML = '<option value="">-- Nuevo / Limpiar Cliente --</option>';
    clientesGuardados.forEach((c, index) => {
        select.innerHTML += `<option value="${index}">${c.nombre}</option>`;
    });
}

function cargarClienteSeleccionado() {
    const select = document.getElementById("selectCliente");
    if (!select) return;
    const idx = select.value;
    
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    if(idx !== "" && clientesGuardados[idx]) {
        const c = clientesGuardados[idx];
        setVal("cliNombre", c.nombre || "");
        setVal("cliDir", c.dir || "");
        setVal("cliTel", c.tel || "");
        setVal("cliNif", c.nif || "");
        setVal("cliEmail", c.email || "");
    } else {
        setVal("cliNombre", "");
        setVal("cliDir", "");
        setVal("cliTel", "");
        setVal("cliNif", "");
        setVal("cliEmail", "");
    }
    actualizar();
}

function renderItems() {
    const container = document.getElementById("itemsContainer");
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item, index) => {
        container.innerHTML += `
            <div class="item-row">
                <input type="text" style="width: 40px;" value="${item.cant}" oninput="items[${index}].cant = this.value; actualizar();">
                <select style="width: 60px;" onchange="items[${index}].unid = this.value; actualizar();">
                    <option value="" ${item.unid===''?'selected':''}>-</option>
                    <option value="ud" ${item.unid==='ud'?'selected':''}>ud</option>
                    <option value="m²" ${item.unid==='m²'?'selected':''}>m²</option>
                    <option value="ml" ${item.unid==='ml'?'selected':''}>ml</option>
                    <option value="kg" ${item.unid==='kg'?'selected':''}>kg</option>
                    <option value="hrs" ${item.unid==='hrs'?'selected':''}>hrs</option>
                </select>
                <input type="text" style="flex: 1;" value="${item.desc}" placeholder="Descripción" oninput="items[${index}].desc = this.value; actualizar();">
                <input type="number" step="any" style="width: 65px;" value="${item.precio}" oninput="items[${index}].precio = parseFloat(this.value)||0; actualizar();">
                <button class="btn-del" onclick="eliminarItem(${index})">×</button>
            </div>
        `;
    });
}

function agregarItem() {
    items.push({ cant: "1", unid: "", desc: "", precio: 0 });
    renderItems();
    actualizar();
}

function eliminarItem(index) {
    if (items.length > 1) {
        items.splice(index, 1);
        renderItems();
        actualizar();
    }
}

function actualizar() {
    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : "";
    };

    const tituloComercial = getVal("empTituloComercial") || "REFORMAS INTEGRALES CARRASCOSA";
    const textLogoFallback = document.getElementById("textLogoFallback");
    if (textLogoFallback) {
        textLogoFallback.innerHTML = tituloComercial.replace(" ", "<br>");
    }

    const empNombre = getVal("empNombre") || "CARRASCOSA ARAUJO ALEJANDRO";
    setTxt("lblEmpNombre", empNombre);
    setTxt("lblEmpNombreFirma", empNombre);
    setTxt("lblEmpNif", getVal("empNif") || "-");
    setTxt("lblEmpDir", getVal("empDir") || "-");
    setTxt("lblEmpTel", getVal("empTel") || "-");
    setTxt("lblEmpEmail", getVal("empEmail") || "-");
    setTxt("lblTitularIban", getVal("empTitularIban") || "-");
    setTxt("lblIban", getVal("empIban") || "-");

    const tipoDoc = getVal("tipoDoc") || "PRESUPUESTO";
    const numDoc = getVal("numDoc") || "";
    
    const fechaInput = getVal("fechaDoc");
    const fechaFormateada = formatearFechaEspanol(fechaInput) || formatearFechaEspanol(obtenerFechaHoyISO());

    setTxt("lblTituloDoc", `${tipoDoc} Nº: ${numDoc}`);
    setTxt("lblFechaDoc", `FECHA: ${fechaFormateada}`);
    setTxt("lblValidezDoc", getVal("validezDoc") || "30 Días");
    setTxt("lblCliNombre", getVal("cliNombre") || "-");
    setTxt("lblCliDir", getVal("cliDir") || "-");
    setTxt("lblCliTel", getVal("cliTel") || "-");
    setTxt("lblCliNif", getVal("cliNif") || "-");
    setTxt("lblCliEmail", getVal("cliEmail") || "-");

    const proyectoVal = getVal("txtProyecto").trim();
    const boxProyecto = document.getElementById("boxProyectoDisplay");
    if (boxProyecto) {
        if (proyectoVal !== "") {
            setTxt("lblProyecto", proyectoVal);
            boxProyecto.style.display = "block";
        } else {
            boxProyecto.style.display = "none";
        }
    }

    setTxt("lblConceptoNota", getVal("txtConceptoBancario"));

    const boxManoObra = document.getElementById("boxManoObra");
    const chkManoObra = document.getElementById("chkManoObra");
    if (boxManoObra && chkManoObra) {
        if (chkManoObra.checked) {
            boxManoObra.style.visibility = "visible";
            boxManoObra.style.display = "block";
        } else {
            boxManoObra.style.visibility = "hidden";
            boxManoObra.style.display = "block";
        }
    }

    const boxIbanDetails = document.getElementById("boxIbanDetails");
    const chkFormaPago = document.getElementById("chkFormaPago");
    if (boxIbanDetails && chkFormaPago) {
        boxIbanDetails.style.display = chkFormaPago.checked ? "block" : "none";
    }

    let tbody = document.getElementById("tablaBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    let base = 0;

    items.forEach(item => {
        let cantStr = String(item.cant || "0").replace(',', '.');
        let cantNum = parseFloat(cantStr) || 0;
        let totalFila = cantNum * (parseFloat(item.precio) || 0);
        base += totalFila;

        let unidadTexto = item.unid ? ` ${item.unid}` : '';

        tbody.innerHTML += `
            <tr>
                <td>${item.cant}${unidadTexto}</td>
                <td>${item.desc}</td>
                <td style="text-align: right;">${(parseFloat(item.precio) || 0).toFixed(2).replace('.', ',')} €</td>
                <td style="text-align: right;">${totalFila.toFixed(2).replace('.', ',')} €</td>
            </tr>
        `;
    });

    let pctIva = parseFloat(getVal("tipoIva")) || 0;
    let cuotaIva = base * (pctIva / 100);
    let totalGeneral = base + cuotaIva;

    setTxt("lblBase", base.toFixed(2).replace('.', ',') + " €");
    setTxt("lblPorcentajeIva", pctIva);
    setTxt("lblCuotaIva", cuotaIva.toFixed(2).replace('.', ',') + " €");
    setTxt("lblTotalGeneral", totalGeneral.toFixed(2).replace('.', ',') + " €");
    
    let pago50 = totalGeneral * 0.5;
    let pago25_1 = totalGeneral * 0.25;
    let pago25_2 = totalGeneral - (pago50 + pago25_1);

    setTxt("lblAdelanto", pago50.toFixed(2).replace('.', ',') + " €");
    setTxt("lblPago2", pago25_1.toFixed(2).replace('.', ',') + " €");
    setTxt("lblPagoFinal", pago25_2.toFixed(2).replace('.', ',') + " €");
}

function descargarPDF() {
    guardarEnHistorial(false);
    const element = document.getElementById("hojaA4");
    if (!element) return;
    const numDocElem = document.getElementById("numDoc");
    const numDoc = numDocElem ? numDocElem.value || "Documento" : "Documento";
    const nombreLimpio = numDoc.replace(/[^a-zA-Z0-9_-]/g, "_");

    const opt = {
        margin: 0,
        filename: `${nombreLimpio}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        if (totalPages > 1 && items.length <= 12) {
            pdf.deletePage(totalPages);
        }
        const blob = pdf.output('blob');
        const fileBlob = new Blob([blob], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileBlob);
        link.download = `${nombreLimpio}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    });
}

function descargarJPG() {
    guardarEnHistorial(false);
    const element = document.getElementById("hojaA4");
    if (!element) return;
    const numDocElem = document.getElementById("numDoc");
    const numDoc = numDocElem ? numDocElem.value || "Documento" : "Documento";
    const nombreLimpio = numDoc.replace(/[^a-zA-Z0-9_-]/g, "_");

    const width = element.offsetWidth;
    const height = Math.round(width * 1.414);

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        width: width,
        height: height,
        windowWidth: width,
        windowHeight: height
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${nombreLimpio}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.click();
    });
}

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    cargarDesplegableHistorial();
    cargarDesplegableLogos();
    cargarDesplegableClientes();
    inicializarNumeracion();
    renderItems();
    actualizar();
});
