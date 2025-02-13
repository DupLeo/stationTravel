export async function callSoapService(coordinateStart, coordinateEnd) {

    console.log("Envoi des données SOAP", coordinateStart, coordinateEnd);

    const c1 = `${coordinateStart.lat},${coordinateStart.lon}`;
    const c2 = `${coordinateEnd.lat},${coordinateEnd.lon}`;

    // Préparation de la requête SOAP
    const soapRequest = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spy="spyne.examples.hello">
            <soapenv:Header/>
            <soapenv:Body>
                <spy:get_travel_time>
                    <spy:city1>${c1}</spy:city1>
                    <spy:city2>${c2}</spy:city2>
                </spy:get_travel_time>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await fetch('http://127.0.0.1:8000', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': ''
            },
            body: soapRequest
        });

        const responseText = await response.text();
        console.log("Réponse SOAP :", responseText);

        const match = responseText.match(/<tns:get_travel_timeResult>(.*?)<\/tns:get_travel_timeResult>/);
        const durationInSeconds = parseFloat(match[1]); 
        const durationInMinutes = durationInSeconds / 60; 
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = Math.round(durationInMinutes % 60);

        const formattedTime = `${hours}h ${minutes}min`;

        document.getElementById('time').innerHTML = formattedTime;
        document.getElementById('time_route').style.display = "block";

    } catch (error) {
        document.getElementById('time').value = `Error: ${error.message}`;
    }
}
