import com.codingame.gameengine.runner.MultiplayerGameRunner;

public class SkeletonMain {
    public static void main(String[] args) {

        MultiplayerGameRunner runner = new MultiplayerGameRunner();
        runner.setLeagueLevel(2);
        runner.addAgent("dotnet /home/eulerschezahl/Documents/Programming/challenges/CodinGame/DiceDuel/bin/Debug/net5.0/DiceDuel.dll");
        runner.addAgent("dotnet /home/eulerschezahl/Documents/Programming/challenges/CodinGame/DiceDuel/bin/Debug/net5.0/DiceDuel.dll");
        runner.start();
    }
}
