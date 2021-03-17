package engine;

import com.codingame.game.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

public class Die {
    /*   0
        415
         2
         3
     */
    private Player owner;
    private int[] state = new int[]{4, 1, 5, 6, 2, 3};
    private int x = 0;
    private int y = 0;
    private int id;
    private static int idCounter;

    public Die(int x, int y, Player owner) {
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.id = idCounter++;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public Player getOwner() {
        return owner;
    }

    public int getId() {
        return id;
    }

    public void rotateUp(int count) {
        for (int i = 0; i < count; i++) {
            int tmp = state[0];
            state[0] = state[1];
            state[1] = state[2];
            state[2] = state[3];
            state[3] = tmp;
        }
    }

    public void rotateRight(int count) {
        for (int i = 0; i < count; i++) {
            int tmp = state[0];
            state[0] = state[4];
            state[4] = state[2];
            state[2] = state[5];
            state[5] = tmp;
        }
    }

    public void rotate(String s) {
        for (char c : s.toCharArray()) {
            if (c == 'U') rotateUp(1);
            if (c == 'D') rotateUp(3);
            if (c == 'R') rotateRight(1);
            if (c == 'L') rotateRight(3);
        }
    }

    public Optional<Die> move(String s, ArrayList<Die> dice) throws InvalidActionException {
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == 'U') y++;
            if (c == 'D') y--;
            if (c == 'R') x++;
            if (c == 'L') x--;
            Optional<Die> collision = dice.stream().filter(d -> d != this && d.x == this.x && d.y == this.y).findFirst();
            if (collision.isPresent()) {
                if (collision.get().owner == this.owner) throw new InvalidActionException("Tried to capture own die");
                if (i+1 < s.length()) throw new InvalidActionException("Collisions may only happen in the last step of the sequence");
            }
        }
        return dice.stream().filter(d -> d != this && d.x == this.x && d.y == this.y).findFirst();
    }

    public Optional<Die> roll(String s, ArrayList<Die> dice) throws InvalidActionException {
        Optional<Die> killed = move(s, dice);
        rotate(s);
        return killed;
    }

    public void scramble(Random random) {
        for (int i = 0; i < 100; i++) {
            if (random.nextInt(2) == 0) rotateUp(random.nextInt(3) + 1);
            else rotateRight(random.nextInt(3) + 1);
        }
    }

    public String getPlayerInput(Player player) {
        int ownerId = owner == player ? 0 : 1;
        String result = ownerId + " " + (char) ('A' + x) + "" + (y + 1);
        for (int s : state) result += " " + s;
        return result;
    }

    public int getTop() {
        return state[0];
    }

    public ArrayList<Move> listMoves(List<Die> team, List<Die> opponent) {
        boolean[][] visited = new boolean[Board.SIZE][Board.SIZE];
        for (Die die : team) visited[die.x][die.y] = true;
        boolean[][] oppPlace = new boolean[Board.SIZE][Board.SIZE];
        for (Die die : opponent) oppPlace[die.x][die.y] = true;
        ArrayList<Move> result = new ArrayList<>();
        moveRecurs(this.x, this.y, visited, oppPlace, "", result);
        return result;
    }

    int[] dx = {0, 1, 0, -1};
    int[] dy = {1, 0, -1, 0};
    String[] dirs = {"D", "R", "U", "L"};

    private void moveRecurs(int x, int y, boolean[][] visited, boolean[][] oppPlace, String s, ArrayList<Move> moves) {
        if (s.length() == getTop()) {
            moves.add(new Move(s, this.x, this.y, x, y, oppPlace[x][y]));
            return;
        }
        if (oppPlace[x][y]) return;
        for (int dir = 0; dir < 4; dir++) {
            int x_ = x + dx[dir];
            int y_ = y + dy[dir];
            if (x_ < 0 || x_ >= Board.SIZE || y_ < 0 || y_ >= Board.SIZE || visited[x_][y_]) continue;
            visited[x_][y_] = true;
            moveRecurs(x_, y_, visited, oppPlace, s + dirs[dir], moves);
            visited[x_][y_] = false;
        }
    }
}
