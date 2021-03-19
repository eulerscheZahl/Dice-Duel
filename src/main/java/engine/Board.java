package engine;

import com.codingame.game.Player;
import com.codingame.gameengine.core.GameManager;
import modules.BoardModule;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class Board {
    public static final int SIZE = 8;
    private ArrayList<Die> dice = new ArrayList<>();
    private BoardModule module;

    public Board(Random random, List<Player> players, BoardModule module) {
        this.module = module;
        for (int i = 0; i < SIZE; i++) {
            Die d1 = new Die(i, 0, players.get(0));
            Die d2 = new Die(SIZE - 1 - i, SIZE - 1, players.get(1));
            String path1 = d1.scramble(random);
            String path2 = d2.mirror(d1);
            dice.add(d1);
            dice.add(d2);
            module.createDie(d1, path1);
            module.createDie(d2, path2);
        }
    }

    public ArrayList<Die> getDice() {
        return dice;
    }

    public ArrayList<String> getPlayerInput(Player player) {
        ArrayList<String> result = new ArrayList<>();
        result.add(String.valueOf(dice.size()));
        for (Die die : dice) result.add(die.getPlayerInput(player));
        return result;
    }

    public ArrayList<Move> listMoves(Player player) {
        ArrayList<Move> moves = new ArrayList<>();
        List<Die> myDice = dice.stream().filter(d -> d.getOwner() == player).collect(Collectors.toList());
        List<Die> oppDice = dice.stream().filter(d -> d.getOwner() != player).collect(Collectors.toList());
        for (Die die : myDice) {
            moves.addAll(die.listMoves(myDice, oppDice));
        }
        return moves;
    }

    public void playMove(Player player, String move, GameManager gameManager) throws InvalidActionException {
        move = move.toUpperCase();
        Pattern pattern = Pattern.compile("^[A-H][1-8] [UDRL]+$");
        Matcher matcher = pattern.matcher(move);
        if (!matcher.find()) throw new InvalidActionException("Bad command");
        String[] parts = move.split(" ");
        int x = parts[0].charAt(0) - 'A';
        int y = parts[0].charAt(1) - '1';
        String path = parts[1];
        gameManager.setFrameDuration(path.length() * 500);
        for (Die die : dice) {
            if (die.getX() == x && die.getY() == y) {
                if (die.getOwner() != player) throw new InvalidActionException("Tried to move opponent's dice");
                if (path.length() != die.getTop()) throw new InvalidActionException("Incorrect path length");
                Optional<Die> killed = die.roll(path, dice);
                module.moveDie(die, path);
                if (killed.isPresent()) {
                    dice.remove(killed.get());
                    module.killDie(killed.get());
                }
                break;
            }
        }
    }
}