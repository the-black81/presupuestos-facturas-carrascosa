/* ============================================================
   app.js - Lógica Principal, Clientes, Logos, Partidas y Exportación
   ============================================================ */

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
    const fecha = document.getElementById("fechaDoc").value || obtenerFechaHoy();

    document.getElementById("lblTituloDoc").innerText = `${tipoDoc} Nº: ${numDoc}`;
    document.getElementById("lblFechaDoc").innerText = `FECHA: ${fecha}`;
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
                <td style="text-align: right;">${totalFila.toFixed(2).replace('.', ',')} €</td>
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
    const opt = {
        margin: 0,
        filename: `${document.getElementById("numDoc").value}.pdf`,
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
    }).save();
}

function descargarJPG() {
    guardarEnHistorial(false);
    const element = document.getElementById("hojaA4");
    html2canvas(element, { scale: 2, useCORS: true, scrollY: 0 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${document.getElementById("numDoc").value}.jpg`;
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