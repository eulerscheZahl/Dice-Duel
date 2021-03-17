package engine;

public class Move {
    public String sequence;
    public int startX, startY;
    public int finalX, finalY;
    public boolean capture;

    public Move(String sequence, int startX, int startY, int finalX, int finalY, boolean capture) {
        this.sequence = sequence;
        this.startX = startX;
        this.startY = startY;
        this.finalX = finalX;
        this.finalY = finalY;
        this.capture = capture;
    }

    @Override
    public String toString() {
        return startX + " " + startY + " " + sequence;
    }
}
