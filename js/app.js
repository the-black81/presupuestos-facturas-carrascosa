/* ============================================================
   app.js - Lógica Principal, Clientes, Logos, Numeración y Exportación
   ============================================================ */

let items = [{ cant: "1", unid: "", desc: "", precio: 0.00 }];
let galeriaLogos = JSON.parse(localStorage.getItem("carrascosa_logos") || "[]");
let clientesGuardados = JSON.parse(localStorage.getItem("carrascosa_clientes") || "[]");
let historialDocumentos = JSON.parse(localStorage.getItem("carrascosa_historial") || "[]");

let numPresupuesto = parseInt(localStorage.getItem("carrascosa_seq_pres") || "1");
let numFactura = parseInt(localStorage.getItem("carrascosa_seq_fact") || "1");

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
    return `${prefijo}-${anio}-${String(numero).padStart(3, '0')}`;
}

function inicializarNumeracion() {
    const tipo = document.getElementById("tipoDoc").value;
    if (tipo === "PRESUPUESTO") {
        document.getElementById("numDoc").value = formatearNumero("PRES", numPresupuesto);
    } else {
        document.getElementById("numDoc").value = formatearNumero("FACT", numFactura);
    }
    
    const inputFecha = document.getElementById("fechaDoc");
    if (inputFecha && !inputFecha.value) {
        inputFecha.value = obtenerFechaHoyISO();
    }
    actualizarBotonToggle();
    actualizar();
}

function cambiarTipoDocUI() {
    inicializarNumeracion();
}

function alternarTipoDocumento() {
    const selectTipo = document.getElementById("tipoDoc");
    if (selectTipo.value === "PRESUPUESTO") {
        selectTipo.value = "FACTURA";
    } else {
        selectTipo.value = "PRESUPUESTO";
    }
    inicializarNumeracion();
}

function actualizarBotonToggle() {
    const tipo = document.getElementById("tipoDoc").value;
    const btn = document.getElementById("btnToggleDoc");
    if (!btn) return;
    
    if (tipo === "PRESUPUESTO") {
        btn.innerText = "🔄 Cambiar a FACTURA";
        btn.style.background = "#7c3aed";
    } else {
        btn.innerText = "🔄 Cambiar a PRESUPUESTO";
        btn.style.background = "#0d9488";
    }
}

function detectarNumeroManualYCargar() {
    const valorInput = document.getElementById("numDoc").value.trim().toUpperCase();
    if (!valorInput) return;

    const coincidencia = historialDocumentos.find(doc => {
        if (doc.numDoc.toUpperCase() === valorInput) return true;
        const partes = doc.numDoc.split("-");
        if (partes.length > 0 && parseInt(partes[partes.length - 1]) === parseInt(valorInput)) {
            return true;
        }
        return false;
    });

    if (coincidencia) {
        cargarDatosDesdeObjeto(coincidencia);
    } else {
        const coincidenciasNum = valorInput.match(/\d+/g);
        if (coincidenciasNum && coincidenciasNum.length > 0) {
            const ultimoNum = parseInt(coincidenciasNum[coincidenciasNum.length - 1]);
            const tipo = document.getElementById("tipoDoc").value;
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
    const docActual = {
        numDoc: document.getElementById("numDoc").value,
        tipoDoc: document.getElementById("tipoDoc").value,
        fechaDoc: document.getElementById("fechaDoc").value,
        validezDoc: document.getElementById("validezDoc").value,
        cliNombre: document.getElementById("cliNombre").value,
        cliDir: document.getElementById("cliDir").value,
        cliTel: document.getElementById("cliTel").value,
        cliNif: document.getElementById("cliNif").value,
        cliEmail: document.getElementById("cliEmail").value,
        txtProyecto: document.getElementById("txtProyecto").value,
        items: JSON.parse(JSON.stringify(items)),
        tipoIva: document.getElementById("tipoIva").value,
        txtConceptoBancario: document.getElementById("txtConceptoBancario").value,
        chkManoObra: document.getElementById("chkManoObra").checked,
        chkFormaPago: document.getElementById("chkFormaPago").checked
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
    const idx = document.getElementById("selectHistorial").value;
    if (idx !== "") {
        cargarDatosDesdeObjeto(historialDocumentos[idx]);
    }
}

function cargarDatosDesdeObjeto(doc) {
    document.getElementById("tipoDoc").value = doc.tipoDoc || "PRESUPUESTO";
    document.getElementById("numDoc").value = doc.numDoc;
    document.getElementById("fechaDoc").value = doc.fechaDoc || obtenerFechaHoyISO();
    document.getElementById("validezDoc").value = doc.validezDoc || "30 Días";
    document.getElementById("cliNombre").value = doc.cliNombre || "";
    document.getElementById("cliDir").value = doc.cliDir || "";
    document.getElementById("cliTel").value = doc.cliTel || "";
    document.getElementById("cliNif").value = doc.cliNif || "";
    document.getElementById("cliEmail").value = doc.cliEmail || "";
    document.getElementById("txtProyecto").value = doc.txtProyecto || "";
    items = doc.items && doc.items.length ? JSON.parse(JSON.stringify(doc.items)) : [{ cant: "1", unid: "", desc: "", precio: 0 }];
    document.getElementById("tipoIva").value = doc.tipoIva || "10";
    document.getElementById("txtConceptoBancario").value = doc.txtConceptoBancario || "(Indicar dirección de la obra en el concepto de la transferencia)";
    document.getElementById("chkManoObra").checked = doc.chkManoObra !== undefined ? doc.chkManoObra : true;
    document.getElementById("chkFormaPago").checked = doc.chkFormaPago !== undefined ? doc.chkFormaPago : true;

    renderItems();
    actualizarBotonToggle();
    actualizar();
}

function eliminarDocumentoActualDelHistorial() {
    const numDoc = document.getElementById("numDoc").value;
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
    const fileReader = new FileReader();
    fileReader.onload = function() {
        try {
            const data = JSON.parse(fileReader.result);
            if (data.historial && data.clientes) {
                historialDocumentos = data.historial;
                clientesGuardados = data.clientes;
                galeriaLogos = data.logos || [];
                numPresupuesto = data.numPresupuesto || 1;
                numFactura = data.numFactura || 1;

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
    const tipo = document.getElementById("tipoDoc").value;
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
    document.getElementById("fechaDoc").value = obtenerFechaHoyISO();
    actualizar();
}

function limpiarFormularioCompleto() {
    document.getElementById("selectCliente").value = "";
    document.getElementById("cliNombre").value = "";
    document.getElementById("cliDir").value = "";
    document.getElementById("cliTel").value = "";
    document.getElementById("cliNif").value = "";
    document.getElementById("cliEmail").value = "";
    document.getElementById("txtProyecto").value = "";
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
    const idx = document.getElementById("selectLogo").value;
    if(idx !== "") {
        aplicarLogoData(galeriaLogos[idx].data);
    } else {
        document.getElementById('imgLogo').style.display = 'none';
        document.getElementById('textLogoFallback').style.display = 'block';
    }
}

function aplicarLogoData(dataUri) {
    const img = document.getElementById('imgLogo');
    img.src = dataUri;
    img.style.display = 'block';
    document.getElementById('textLogoFallback').style.display = 'none';
}

function guardarClienteActual() {
    const nombreCli = document.getElementById("cliNombre").value.trim();
    if (!nombreCli) {
        alert("Por favor, introduce al menos un nombre para guardar el cliente.");
        return;
    }

    const cliente = {
        nombre: nombreCli,
        dir: document.getElementById("cliDir").value,
        tel: document.getElementById("cliTel").value,
        nif: document.getElementById("cliNif").value,
        email: document.getElementById("cliEmail").value
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
    const idx = document.getElementById("selectCliente").value;
    if(idx !== "") {
        const c = clientesGuardados[idx];
        document.getElementById("cliNombre").value = c.nombre || "";
        document.getElementById("cliDir").value = c.dir || "";
        document.getElementById("cliTel").value = c.tel || "";
        document.getElementById("cliNif").value = c.nif || "";
        document.getElementById("cliEmail").value = c.email || "";
    } else {
        document.getElementById("cliNombre").value = "";
        document.getElementById("cliDir").value = "";
        document.getElementById("cliTel").value = "";
        document.getElementById("cliNif").value = "";
        document.getElementById("cliEmail").value = "";
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
                <input type="number" style="width: 65px;" value="${item.precio}" oninput="items[${index}].precio = parseFloat(this.value)||0; actualizar();">
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
    const tituloComercial = document.getElementById("empTituloComercial").value || "REFORMAS INTEGRALES CARRASCOSA";
    document.getElementById("textLogoFallback").innerHTML = tituloComercial.replace(" ", "<br>");

    const empNombre = document.getElementById("empNombre").value || "CARRASCOSA ARAUJO ALEJANDRO";
    document.getElementById("lblEmpNombre").innerText = empNombre;
    document.getElementById("lblEmpNombreFirma").innerText = empNombre;
    document.getElementById("lblEmpNif").innerText = document.getElementById("empNif").value || "-";
    document.getElementById("lblEmpDir").innerText = document.getElementById("empDir").value || "-";
    document.getElementById("lblEmpTel").innerText = document.getElementById("empTel").value || "-";
    document.getElementById("lblEmpEmail").innerText = document.getElementById("empEmail").value || "-";
    document.getElementById("lblTitularIban").innerText = document.getElementById("empTitularIban").value || "-";
    document.getElementById("lblIban").innerText = document.getElementById("empIban").value || "-";

    const tipoDoc = document.getElementById("tipoDoc").value;
    const numDoc = document.getElementById("numDoc").value;
    
    const fechaInput = document.getElementById("fechaDoc").value;
    const fechaFormateada = formatearFechaEspanol(fechaInput) || formatearFechaEspanol(obtenerFechaHoyISO());

    document.getElementById("lblTituloDoc").innerText = `${tipoDoc} Nº: ${numDoc}`;
    document.getElementById("lblFechaDoc").innerText = `FECHA: ${fechaFormateada}`;
    document.getElementById("lblValidezDoc").innerText = document.getElementById("validezDoc").value || "30 Días";
    document.getElementById("lblCliNombre").innerText = document.getElementById("cliNombre").value || "-";
    document.getElementById("lblCliDir").innerText = document.getElementById("cliDir").value || "-";
    document.getElementById("lblCliTel").innerText = document.getElementById("cliTel").value || "-";
    document.getElementById("lblCliNif").innerText = document.getElementById("cliNif").value || "-";
    document.getElementById("lblCliEmail").innerText = document.getElementById("cliEmail").value || "-";

    const proyectoVal = document.getElementById("txtProyecto").value.trim();
    const boxProyecto = document.getElementById("boxProyectoDisplay");
    if (proyectoVal !== "") {
        document.getElementById("lblProyecto").innerText = proyectoVal;
        boxProyecto.style.display = "block";
    } else {
        boxProyecto.style.display = "none";
    }

    document.getElementById("lblConceptoNota").innerText = document.getElementById("txtConceptoBancario").value || "";

    const boxManoObra = document.getElementById("boxManoObra");
    if (document.getElementById("chkManoObra").checked) {
        boxManoObra.style.visibility = "visible";
        boxManoObra.style.display = "block";
    } else {
        boxManoObra.style.visibility = "hidden";
        boxManoObra.style.display = "block";
    }

    document.getElementById("boxIbanDetails").style.display = document.getElementById("chkFormaPago").checked ? "block" : "none";

    let tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";
    let base = 0;

    items.forEach(item => {
        let cantNum = parseFloat(item.cant.replace(',', '.')) || 0;
        let totalFila = cantNum * item.precio;
        base += totalFila;

        let unidadTexto = item.unid ? ` ${item.unid}` : '';

        tbody.innerHTML += `
            <tr>
                <td>${item.cant}${unidadTexto}</td>
                <td>${item.desc}</td>
                <td style="text-align: right;">${item.precio.toFixed(2).replace('.', ',')} €</td>
                <td style="text-align: right;">${totalFila.toFixed(2).replace('.', ',')} €</td>
            </tr>
        `;
    });

    let pctIva = parseFloat(document.getElementById("tipoIva").value);
    let cuotaIva = base * (pctIva / 100);
    let totalGeneral = base + cuotaIva;

    document.getElementById("lblBase").innerText = base.toFixed(2).replace('.', ',') + " €";
    document.getElementById("lblPorcentajeIva").innerText = pctIva;
    document.getElementById("lblCuotaIva").innerText = cuotaIva.toFixed(2).replace('.', ',') + " €";
    document.getElementById("lblTotalGeneral").innerText = totalGeneral.toFixed(2).replace('.', ',') + " €";
    
    let pago50 = totalGeneral * 0.5;
    let pago25_1 = totalGeneral * 0.25;
    let pago25_2 = totalGeneral - (pago50 + pago25_1);

    document.getElementById("lblAdelanto").innerText = pago50.toFixed(2).replace('.', ',') + " €";
    document.getElementById("lblPago2").innerText = pago25_1.toFixed(2).replace('.', ',') + " €";
    document.getElementById("lblPagoFinal").innerText = pago25_2.toFixed(2).replace('.', ',') + " €";
}

function descargarPDF() {
    guardarEnHistorial(false);
    const element = document.getElementById("hojaA4");
    const numDoc = document.getElementById("numDoc").value || "Documento";
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
    const numDoc = document.getElementById("numDoc").value || "Documento";
    const nombreLimpio = numDoc.replace(/[^a-zA-Z0-9_-]/g, "_");

    html2canvas(element, { scale: 2, useCORS: true, scrollY: 0 }).then(canvas => {
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
