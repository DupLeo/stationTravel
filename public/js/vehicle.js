/**
 * Récupère les véhicules
 */
async function getVehicule() {
    const response = await fetch(`http://localhost:3000/api/vehicules`);
    const data = await response.json();

    if (data.length === 0) return null;

    return data.data
}


export async function displayVehicule() {
    const vehicle = await getVehicule()
    document.getElementById("vehicle").addEventListener("click", function () {
        suggestVehicle(vehicle, "vehicle_suggestions")
    });
}

async function suggestVehicle(vehicle, suggestionContainerId) {
    const suggestions = vehicle;
    if (suggestions.length === 0) return;

    console.log(vehicle)

    // Réinitialiser le conteneur
    const container = document.getElementById(suggestionContainerId);
    container.innerHTML = "";

    suggestions.forEach(suggestion => {
        // Créer le div pour chaque suggestion
        let div = document.createElement("div");
        div.className = "suggestion";

        // Créer un élément pour l'image
        let img = document.createElement("img");
        img.src = suggestion.image;  // Assurez-vous que l'URL de l'image est correcte
        img.alt = suggestion.name;
        img.className = "suggestion-image";  // Vous pouvez ajouter des styles pour l'image

        // Créer un élément pour le nom et l'autonomie
        let text = document.createElement("span");
        text.className = "suggestion-text";
        text.innerHTML = `${suggestion.name} - ${suggestion.range} km`;

        // Ajouter l'image et le texte au div de suggestion
        div.appendChild(img);
        div.appendChild(text);

        // Événement au clic pour remplir la valeur du champ
        div.addEventListener("click", () => {
            const inputField = document.getElementById(suggestionContainerId.replace("_suggestions", ""));
            inputField.value = suggestion.name;  
            inputField.setAttribute("data-range", suggestion.range);
            container.innerHTML = "";
        });

        // Ajouter la suggestion au conteneur
        container.appendChild(div);
    });
}
