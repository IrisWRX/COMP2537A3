var pokemon = [];

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5;

const setup = async () => {
  try {
    let response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
    );

    pokemon = response.data.results;

    for (let i = 0; i < pokemon.length; i++) {
      const res = await axios.get(pokemon[i].url);
      pokemon[i] = res.data;
    }

    numPages = Math.ceil(pokemon.length / numPerPage);

    const typeResponse = await axios.get("https://pokeapi.co/api/v2/type/");
    const types = typeResponse.data.results;

    types.forEach((type) => {
      $("#typeFilter").append(`
      <div class="form-check">
        <input class="form-check-input typeCheckbox" type="checkbox" value="${type.name}" id="${type.name}">
        <label class="form-check-label" for="${type.name}">
          ${type.name}
        </label>
      </div>
    `);
    });

    showPage(1);

    $("body").on("click", ".pokeCard", async function (e) {
      const pokemonName = $(this).attr("pokeName");
      const res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
      );
      const types = res.data.types.map((type) => type.type.name);

      $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>
        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>
        </div>
        </div>
        <h3>Types</h3>
        <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
        </ul>    
        `);
      $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        `);
    });

    $("body").on("click", ".pageBtn", async function (e) {
      const pageNum = parseInt($(this).attr("pageNum"));
      showPage(pageNum);
    });

    $("#typeFilter").on("change", ".typeCheckbox", function (e) {
      const checkedTypes = $(".typeCheckbox:checked")
        .map(function () {
          return $(this).val();
        })
        .get();

      if (checkedTypes.length === 0) {
        showPage(1, pokemon);
      } else {
        const filteredPokemon = pokemon.filter((p) => {
          if (!p.types) return false;
          let pokemonTypes = p.types.map((t) => t.type.name);
          return checkedTypes.every((type) => pokemonTypes.includes(type));
        });

        numPages = Math.ceil(filteredPokemon.length / numPerPage);
        showPage(1, filteredPokemon);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

async function showPage(currentPage, filteredPokemon = pokemon) {
  const pokemonsToDisplay = filteredPokemon || pokemon;

  if (currentPage < 1) {
    currentPage = 1;
  }
  if (currentPage > numPages) {
    currentPage = numPages;
  }

  const start = (currentPage - 1) * numPerPage;
  const end = Math.min(start + numPerPage, pokemonsToDisplay.length);

  $("#pokemon").empty();
  for (let i = start; i < end; i++) {
    let thisPokemon = pokemonsToDisplay[i];
    $("#pokemon").append(`
      <div class="pokeCard card" pokeName="${thisPokemon.name}"  >
        <h3>${thisPokemon.name.toUpperCase()}</h3> 
        <img src="${thisPokemon.sprites.front_default}" alt="${
      thisPokemon.name
    }"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `);
  }

  $("#pagination").empty();
  var startI = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
  var endI = Math.min(numPages, currentPage + Math.floor(numPageBtn / 2));

  if (currentPage > 1) {
    $("#pagination").append(`
        <button type="button" class="btn btn-primary pageBtn" id="pageprev" pageNum="${
          currentPage - 1
        }">Prev</button>
    `);
  }
  for (let i = startI; i <= endI; i++) {
    var active = "";
    if (i == currentPage) {
      active = "active";
    }
    $("#pagination").append(`
        <button type="button" class="btn btn-primary pageBtn ${active}" id="page${i}" pageNum="${i}">${i}</button>
        `);
  }
  if (currentPage < numPages) {
    $("#pagination").append(`
        <button type="button" class="btn btn-primary pageBtn" id="pagenext" pageNum="${
          currentPage + 1
        }">Next</button>
    `);
  }

  $("#pokemon-count").html(
    `<h3>Showing ${end - start} of ${pokemon.length} pokemons</h3>`
  );
}

$(document).ready(setup);
