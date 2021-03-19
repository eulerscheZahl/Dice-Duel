package engine;

import com.codingame.game.Player;

import java.util.*;

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

    private static ArrayList<DiePath> rotations = new ArrayList<>();
    static {
        Die die = new Die(0, 0, null);
        rotations.add(new DiePath("", die));
        HashSet<Integer> reached = new HashSet<>();
        reached.add(die.state[0] * 10 + die.state[1]);
        while (rotations.size() < 24) {
            for (int i = rotations.size() - 1; i >= 0; i--) {
                String path = rotations.get(i).path;
                Die d = rotations.get(i).die;
                for (String dir : new String[]{"U", "D", "R", "L"}) {
                    Die d2 = new Die(0, 0, null);
                    d2.state = Arrays.copyOf(d.state, d.state.length);
                    d2.rotate(dir);
                    if (reached.contains(d2.state[0] * 10 + d2.state[1])) continue;
                    reached.add(d2.state[0] * 10 + d2.state[1]);
                    rotations.add(new DiePath(path + dir, d2));
                }
            }
        }
        idCounter = 0;
    }

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

    public String scramble(Random random) {
        int idx = random.nextInt(rotations.size());
        Die die = rotations.get(idx).die;
        this.state = Arrays.copyOf(die.state, die.state.length);
        return rotations.get(idx).path;
    }

    public String mirror(Die die) {
        for (DiePath rot : rotations) {
            if (rot.die.getTop() == die.getTop() && rot.die.state[1] == die.state[3]) {
                this.state = Arrays.copyOf(rot.die.state, rot.die.state.length);
                return rot.path;
            }
        }
        return "";
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
