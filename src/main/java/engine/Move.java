package engine;

import java.util.List;

public class Move {
    public String sequence;
    public int startX, startY;
    public int finalX, finalY;
    public boolean capture;
    public boolean nonAdversary;

    public Move(String sequence, Die die, int finalX, int finalY, boolean capture, List<Die> oppDice) {
        this.sequence = sequence;
        this.startX = die.getX();
        this.finalX = die.getY();
        this.finalY = finalY;
        this.capture = capture;

        for (Die opp : oppDice) {
            if (opp.getX() == finalX && opp.getY() == finalY) {
                Die d = new Die(die);
                d.rotate(sequence);
                if (d.getTop() + opp.getTop() != 7) this.nonAdversary = true;
            }
        }
    }

    @Override
    public String toString() {
        return startX + " " + startY + " " + sequence;
    }
}
