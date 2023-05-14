var pokemon = [];

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5;

const setup = async () => {
  // $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );

  pokemon = response.data.results;
  numPages = Math.ceil(pokemon.length / numPerPage);

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
};

async function showPage(currentPage) {
  if (currentPage < 1) {
    currentPage = 1;
  }
  if (currentPage > numPages) {
    currentPage = numPages;
  }

  $("#pokemon").empty();
  for (
    let i = (currentPage - 1) * numPerPage;
    i < (currentPage - 1) * numPerPage + numPerPage && i < pokemon.length;
    i++
  ) {
    let innerResponse = await axios.get(`${pokemon[i].url}`);
    let thisPokemon = innerResponse.data;
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
  for (let i = startI; i <= endI; i++) {
    $("#pagination").append(`
        <button type="button" class="btn btn-primary pageBtn" id="page${i}" pageNum="${i}">${i}</button>
        `);
  }
}

$(document).ready(setup);
