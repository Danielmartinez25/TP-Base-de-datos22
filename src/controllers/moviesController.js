const path = require("path");
const db = require("../database/models");
const moment = require("moment");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { promiseImpl } = require("ejs");

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
  list: (req, res) => {
    db.Movie.findAll().then((movies) => {
      res.render("moviesList.ejs", { movies });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    db.Genre.findAll({
      order: ["name"],
    })
      .then((allGenres) => {
        res.render("moviesAdd", { allGenres });
      })
      .catch((err) => console.log(err));
  },
  create: function (req, res) {
    const { title, release_date, awards, length, rating, genre } = req.body;
    db.Movie.create({
      title: title.trim(),
      release_date,
      awards,
      length,
      rating,
      genre_id: genre,
    }).then((movie) => {
      console.log(movie);
      return res.redirect("/movies");
    });
  },
  edit: function (req, res) {
    let Movie = Movies.findByPk(req.params.id);
    let allGenres = Genres.findAll({
      order: ["name"],
    });
    Promise.all([Movie, allGenres])
      .then(([Movie, allGenres]) => {
        return res.render("moviesEdit", {
          Movie,
          allGenres,
          moment: moment,
        });
      })
      .catch((error) => console.log(error));
  },
  update: function (req, res) {
    const { title, release_date, awards, length, rating, genre } = req.body;
    Movies.update(
      {
        title: title.trim(),
        release_date,
        awards,
        length,
        rating,
        genre,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
      .then(() => res.redirect("/movies/detail/" + req.params.id))
      .catch((error) => console.log(error));
  },
  delete: function (req, res) {
    db.Movie.findByPk(req.params.id).then((Movie) => {
      res.render("moviesDelete.ejs", { Movie });
    });
  },
  destroy: function (req, res) {
    db.Movie.destroy({
      where: { id: req.params.id },
    });
    res.redirect("/movies");
  },
};

module.exports = moviesController;
