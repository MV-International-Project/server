const {AppError} = require("../errors");
const gameRepository = require("../repositories/game_repository");

async function getGameById(gameId) {
    let game = await gameRepository.getGame(gameId);

    if (game === null) {
        throw new AppError(404, "Game not found.");
    }

    return game;
}

module.exports = {
    getGameById
};