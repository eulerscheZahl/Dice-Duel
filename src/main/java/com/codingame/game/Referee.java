package com.codingame.game;

import com.codingame.gameengine.core.AbstractPlayer.TimeoutException;
import com.codingame.gameengine.core.AbstractReferee;
import com.codingame.gameengine.core.MultiplayerGameManager;
import com.google.inject.Inject;
import engine.Board;
import engine.Die;
import engine.InvalidActionException;
import modules.BoardModule;

import java.util.Random;

public class Referee extends AbstractReferee {
	@Inject
	private MultiplayerGameManager<Player> gameManager;
	@Inject
	private BoardModule boardModule;
	private Board board;

	@Override
	public void init() {
		board = new Board(new Random(gameManager.getSeed()), gameManager.getPlayers(), boardModule);
	}

	private void loseGame(Player player, String message, boolean crashed) {
		player.setScore(crashed ? -1 : 0);
		player.deactivate(message);
		gameManager.addToGameSummary(player.getNicknameToken() + ": " + message);
		gameManager.endGame();
	}

	@Override
	public void onEnd() {
		for (Player player : gameManager.getPlayers()) {
			if (!player.isActive()) continue;
			player.setScore((int)board.getDice().stream().filter(d -> d.getOwner() == player).count());
		}
	}

	@Override
	public void gameTurn(int turn) {
		Player player = gameManager.getPlayer((turn + 1) % 2);
		if (board.listMoves(player, gameManager).size() == 0) {
			loseGame(player, "No valid moves", false);
			return;
		}

		for (String line : board.getPlayerInput(player)) player.sendInputLine(line);
		player.execute();
		try {
			String output = player.getOutputs().get(0);
			board.playMove(player, output, gameManager);
			gameManager.getPlayer(0).setScore((int)board.getDice().stream().filter(d -> d.getOwner().getIndex() == 0).count());
			gameManager.getPlayer(1).setScore((int)board.getDice().stream().filter(d -> d.getOwner().getIndex() == 1).count());
		} catch (TimeoutException e) {
			loseGame(player, "timeout", true);
		} catch (InvalidActionException e) {
			loseGame(player, e.getMessage(), true);
		}
	}
}