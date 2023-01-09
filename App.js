
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const activityInput = document.getElementById("activity");

const submit = document.getElementById("submitBtn");

const cardContainer = document.getElementById("cards-container");
const mealsDetails = document.getElementById("details");
const ingredientSection = document.getElementById("ingredients");
const stepsSection = document.getElementById("steps");
const equipmentSection = document.getElementById("equipment");
const recipeSection = document.getElementById("recipe-section");
const apiKey = "a1dd2daa16304f5fbeace61a0cf82903";

const getCalorie = () => {
    let height = heightInput.value;
    let weight = weightInput.value;
    let age = ageInput.value;
    let gender = genderInput.value;
    let physicalActivity = activityInput.value;
    let bmr;

    if (height === "" || height <= 0 || weight === "" || weight <= 0 || age === "" || age <= 0) {
        alert(
            "Please fill all the fields with valid inputs."
        );
        return;
    }

    if (gender === "female") {
        bmr = 65.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
    } else if (gender === "male") {
        bmr = 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
    }

    // Daily Calorie Requirement
    if (physicalActivity === "light") {
        bmr *= 1.375;
    } else if (physicalActivity === "moderate") {
        bmr *= 1.55;
    } else if (physicalActivity === "active") {
        bmr *= 1.725;
    }

    getMeals(bmr);
};

const getMeals = async(bmr) => {
    document.getElementById("loader").style.display = "block";
    const url = `https://api.spoonacular.com//mealplanner/generate?timeFrame=day&targetCalories=${bmr}&apiKey=${apiKey}&includeNutrition=true`;

    let mealData;
    await fetch(url)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            mealData = data;
        });
    generateMealsCard(mealData);
    
    document.getElementById("loader").style.display = "none";
};

const generateMealsCard = (mealData) => {
    let cards = ``;
    mealsDetails.innerHTML = `
  <h1>Nutrients</h1>
  <div class="d-flex justify-content-center">
      <p class="px-2">Calories : ${mealData.nutrients.calories}</p>
      <p class="px-2">Carbohydrates : ${mealData.nutrients.carbohydrates}</p>
      <p class="px-2">Fat : ${mealData.nutrients.fat}</p>
      <p class="px-2">Protein : ${mealData.nutrients.protein}</p>
  </div>
  `;
    mealData.meals.map(async(data,index) => {
        const url = `https://api.spoonacular.com/recipes/${data.id}/information?apiKey=${apiKey}&includeNutrition=false`;
        let imgURL;

        await fetch(url)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                imgURL = data.image;
            });

        cards += `
        <div class="col-md-4 d-flex justify-content-center mb-2">
            <div class="card baseBlock" style="width: 18rem;">
            
                <img src=${imgURL} class="card-img-top"
                    alt="meal 1">
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p>Preparation Time - ${data.readyInMinutes}</p>
                    <button class="btn btn-outline-primary" onClick="btnRecipe(${data.id})" >Get Recipe</button>
                </div>
            </div>
        </div>
        `;
        cardContainer.innerHTML = cards;
    });
};

const btnRecipe = async(id) => {
    recipeSection.innerHTML = "";
    ingredientSection.innerHTML = "";
    stepsSection.innerHTML = "";
    equipmentSection.innerHTML = "";
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`;
    let information;

    await fetch(url)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            information = data;
        });

    recipeSection.textContent = `${information.title} Recipe`;

    //   Ingredients
    let htmlData = ``;
    let inCardDiv = document.createElement("div");
    inCardDiv.classList.add("carddesign", "card", "h-100");
    let inCardBody = document.createElement("div");
    inCardBody.classList.add("card-body");
    let inOverlay = document.createElement("div");
    inOverlay.classList.add("overlay");
    let ul = document.createElement("ul");
    information.extendedIngredients.map((ingre) => {
        htmlData += `
        <li>${ingre.original}</li>
        `;
    });
    ul.innerHTML = htmlData;
    let ingreH1 = document.createElement("h3");
    ingreH1.textContent = "INGREDIENTS";
    inCardBody.appendChild(inOverlay);
    inCardBody.appendChild(ingreH1);
    inCardBody.appendChild(ul);
    inCardDiv.appendChild(inCardBody);
    ingredientSection.appendChild(inCardDiv);

    //   Steps
    let stepsHtml = ``;
    let stepsCardDiv = document.createElement("div");
    stepsCardDiv.classList.add("carddesign", "card", "h-100");
    let stepsCardBody = document.createElement("div");
    stepsCardBody.classList.add("card-body");
    let stepsOverlay = document.createElement("div");
    stepsOverlay.classList.add("overlay");
    let stepsOl = document.createElement("ol");
    information.analyzedInstructions[0].steps.map((step) => {
        stepsHtml += `
        <li>${step.step}</li>
        `;
    });
    stepsOl.innerHTML = stepsHtml;
    let stepsH1 = document.createElement("h3");
    stepsH1.textContent = "STEPS";
    stepsCardBody.appendChild(stepsOverlay);
    stepsCardBody.appendChild(stepsH1);
    stepsCardBody.appendChild(stepsOl);
    stepsCardDiv.appendChild(stepsCardBody);
    stepsSection.appendChild(stepsCardDiv);

    // equipmentSection
    const urlEquip = `https://api.spoonacular.com/recipes/${id}/equipmentWidget.json?apiKey=${apiKey}&includeNutrition=false`;
    let equip;

    await fetch(urlEquip)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            equip = data;
        });

    let equipData = ``;
    let eqCardDiv = document.createElement("div");
    eqCardDiv.classList.add("carddesign", "card", "h-100");
    let eqCardBody = document.createElement("div");
    eqCardBody.classList.add("card-body");
    let eqOverlay = document.createElement("div");
    eqOverlay.classList.add("overlay");
    let equipUl = document.createElement("ul");
    equip.equipment.map((equipment) => {
        equipData += `
            <li>${equipment.name}</li>
            `;
    });
    equipUl.innerHTML = equipData;
    let equipH1 = document.createElement("h3");
    equipH1.textContent = "EQUIPMENT";
    eqCardBody.appendChild(eqOverlay);
    eqCardBody.appendChild(equipH1);
    eqCardBody.appendChild(equipUl);
    eqCardDiv.appendChild(eqCardBody);
    equipmentSection.appendChild(eqCardDiv);
};

submit.addEventListener("click", getCalorie);