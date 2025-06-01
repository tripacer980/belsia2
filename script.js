async function loadFamilyData() {
    try {
        const response = await fetch('family_data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors du chargement du fichier JSON :", error);
        return [];
    }
}

function createPersonElement(person) {
    const personDiv = document.createElement('div');
    personDiv.classList.add('person');
    personDiv.innerHTML = `
        <h3>${person.firstName} ${person.lastName}</h3>
        <p>Naissance: ${person.birthDate} à ${person.birthPlace}</p>
    `;
    return personDiv;
}

function renderGenealogyTree(data) {
    const treeContainer = document.getElementById('genealogy-tree');
    treeContainer.innerHTML = ''; // Effacer le contenu précédent

    const familyMap = data.reduce((acc, person) => {
        acc[person.id] = person;
        return acc;
    }, {});

    // Trouver la ou les personnes racines (celles sans parents ou avec relation null)
    const roots = data.filter(person => !person.parents || person.relation === null);

    const processed = new Set(); // Pour éviter les boucles infinies

    function buildGeneration(people) {
        if (!people || people.length === 0) {
            return;
        }

        const generationDiv = document.createElement('div');
        generationDiv.classList.add('generation');

        const nextGeneration = [];

        people.forEach(personId => {
            if (processed.has(personId)) {
                return;
            }
            processed.add(personId);

            const person = familyMap[personId];
            const personElement = createPersonElement(person);
            generationDiv.appendChild(personElement);

            // Afficher le conjoint s'il existe et n'a pas déjà été traité
            if (person.spouse) {
                const spouse = familyMap[person.spouse];
                if (spouse && !processed.has(spouse.id)) {
                    const spouseElement = createPersonElement(spouse);
                    const connector = document.createElement('div');
                    connector.classList.add('spouse-connector');
                    generationDiv.appendChild(connector);
                    generationDiv.appendChild(spouseElement);
                    processed.add(spouse.id);
                }
            }

            // Afficher les enfants
            if (person.children && person.children.length > 0) {
                const childrenGroup = document.createElement('div');
                childrenGroup.classList.add('children-group');
                const parentConnector = document.createElement('div');
                parentConnector.classList.add('parent-connector');
                personElement.appendChild(parentConnector);

                person.children.forEach(childId => {
                    nextGeneration.push(childId);
                    const childConnector = document.createElement('div');
                    childConnector.classList.add('child-connector');
                    const childElementContainer = document.createElement('div');
                    childElementContainer.appendChild(createPersonElement(familyMap[childId]));
                    childElementContainer.insertBefore(childConnector, childElementContainer.firstChild);
                    childrenGroup.appendChild(childElementContainer);
                });
                generationDiv.appendChild(childrenGroup);
            }
        });

        if (generationDiv.children.length > 0) {
            treeContainer.appendChild(generationDiv);
            buildGeneration(nextGeneration);
        }
    }

    buildGeneration(roots.map(root => root.id));
}

// Charger les données et construire l'arbre
loadFamilyData().then(data => {
    renderGenealogyTree(data);
});