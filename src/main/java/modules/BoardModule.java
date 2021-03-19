package modules;

import com.codingame.gameengine.core.AbstractPlayer;
import com.codingame.gameengine.core.GameManager;
import com.codingame.gameengine.core.Module;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import engine.Die;

@Singleton
public class BoardModule implements Module {
    private GameManager gameManager;
    private String commit = "";

    @Inject
    BoardModule(GameManager<AbstractPlayer> gameManager) {
        this.gameManager = gameManager;
        gameManager.registerModule(this);
    }

    public void createDie(Die die, String path) {
        commit += ";C " + die.getId() + " " + die.getOwner().getIndex() + " " + die.getX() + " " + die.getY() + " " + path;
    }

    public void moveDie(Die die, String path) {
        commit += ";M " + die.getId() + " " + path;
    }

    public void killDie(Die die) {
        commit += ";K " + die.getId();
    }

    @Override
    public void onGameInit() {
        sendFrameData();
    }

    @Override
    public void onAfterGameTurn() {
        sendFrameData();
    }

    @Override
    public void onAfterOnEnd() {
        sendFrameData();
    }

    private void sendFrameData() {
        if (commit.length() > 0) gameManager.setViewData("board", commit.substring(1));
        commit = "";
    }
}
