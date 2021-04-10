using System;
using System.Collections.Generic;
using System.Linq;

public class Solution
{
    const int SIZE = 8;

    class Move
    {
        public string Sequence;
        public int StartX, StartY;
        public int FinalX, FinalY;
        public bool capture;
        public int[] State;
        public int InitialTop;

        public Move(string sequence, int startX, int startY, int finalX, int finalY, bool capture, int initialTop, int[] state)
        {
            this.Sequence = sequence;
            this.StartX = startX;
            this.StartY = startY;
            this.FinalX = finalX;
            this.FinalY = finalY;
            this.capture = capture;
            this.InitialTop = initialTop;
            this.State = state.ToArray();
        }

        public override string ToString()
        {
            return (char)(StartX + 'A') + "" + (StartY + 1) + " " + Sequence;
        }
    }

    class Die
    {
        public bool Mine;
        public int X, Y, Top;
        public int[] State;

        public Die(int owner, int x, int y, int[] state)
        {
            this.Mine = owner == 0;
            this.X = x;
            this.Y = y;
            this.Top = state[0];
            this.State = state.ToArray();
        }

        private Random random = new Random(0);
        public List<Move> ListMoves(List<Die> team, List<Die> opponent)
        {
            bool[,] visited = new bool[SIZE, SIZE];
            foreach (Die die in team) visited[die.X, die.Y] = true;
            int[,] oppPlace = new int[SIZE, SIZE];
            foreach (Die die in opponent) oppPlace[die.X, die.Y] = die.Top;
            List<Move> result = new List<Move>();
            MoveRecurs(this.X, this.Y, visited, oppPlace, "", result);
            List<Move> scrambled = new List<Move>();
            while (result.Count > 0)
            {
                int idx = random.Next(result.Count);
                scrambled.Add(result[idx]);
                result.RemoveAt(idx);
            }
            return scrambled;
        }

        private static int[] dx = { 0, 1, 0, -1 };
        private static int[] dy = { 1, 0, -1, 0 };
        private static string[] dirs = { "U", "R", "D", "L" };

        private void RotateUp(int count)
        {
            for (int i = 0; i < count; i++)
            {
                int tmp = State[0];
                State[0] = State[1];
                State[1] = State[2];
                State[2] = State[3];
                State[3] = tmp;
            }
        }

        private void RotateRight(int count)
        {
            for (int i = 0; i < count; i++)
            {
                int tmp = State[0];
                State[0] = State[4];
                State[4] = State[2];
                State[2] = State[5];
                State[5] = tmp;
            }
        }

        private void MoveRecurs(int x, int y, bool[,] visited, int[,] oppPlace, string s, List<Move> moves)
        {
            if (s.Length == Top)
            {
                if (oppPlace[x, y] == 0 || oppPlace[x, y] + State[0] == 7)
                    moves.Add(new Move(s, this.X, this.Y, x, y, oppPlace[x, y] != 0, Top, State));
                return;
            }
            if (oppPlace[x, y] != 0) return;
            for (int dir = 0; dir < 4; dir++)
            {
                int x_ = x + dx[dir];
                int y_ = y + dy[dir];
                if (x_ < 0 || x_ >= SIZE || y_ < 0 || y_ >= SIZE || visited[x_, y_]) continue;
                visited[x_, y_] = true;
                if (dir == 0) RotateUp(1);
                if (dir == 1) RotateRight(1);
                if (dir == 2) RotateUp(3);
                if (dir == 3) RotateRight(3);
                MoveRecurs(x_, y_, visited, oppPlace, s + dirs[dir], moves);
                if (dir == 0) RotateUp(3);
                if (dir == 1) RotateRight(3);
                if (dir == 2) RotateUp(1);
                if (dir == 3) RotateRight(1);
                visited[x_, y_] = false;
            }
        }
    }

    class Board
    {
        public List<Die> Dice = new List<Die>();

        public Board()
        {
            int diceCount = int.Parse(Console.ReadLine());
            Console.Error.WriteLine(diceCount);
            for (int i = 0; i < diceCount; i++)
            {
                string[] line = Console.ReadLine().Split();
                Console.Error.WriteLine(string.Join(" ", line));
                int owner = int.Parse(line[0]);
                int x = line[1][0] - 'A';
                int y = line[1][1] - '1';
                int s0 = int.Parse(line[2]);
                int s1 = int.Parse(line[3]);
                int s2 = int.Parse(line[4]);
                int s3 = int.Parse(line[5]);
                int s4 = int.Parse(line[6]);
                int s5 = int.Parse(line[7]);
                Dice.Add(new Die(owner, x, y, new int[] { s0, s1, s2, s3, s4, s5 }));
            }
        }

        public string Play()
        {
            List<Move> myMoves = new List<Move>();
            List<Move> oppMoves = new List<Move>();
            List<Die> myDice = Dice.Where(d => d.Mine).ToList();
            List<Die> oppDice = Dice.Where(d => !d.Mine).ToList();
            foreach (Die die in myDice) myMoves.AddRange(die.ListMoves(myDice, oppDice));
            foreach (Die die in oppDice) oppMoves.AddRange(die.ListMoves(oppDice, myDice));
            bool[,] oppReachable = new bool[SIZE, SIZE];
            foreach (Move move in oppMoves) oppReachable[move.FinalX, move.FinalY] = true;
            myMoves = myMoves.OrderByDescending(m => m.State[0] - m.InitialTop + (m.capture ? 100 : 0) - (oppReachable[m.FinalX, m.FinalY] ? 50 : 0) + (oppReachable[m.StartX, m.StartY] ? 50 : 0)).ToList();
            return myMoves[0].ToString();
        }
    }

    public static void Main(string[] args)
    {
        // game loop
        while (true)
        {
            Board board = new Board();
            string move = board.Play();
            Console.WriteLine(move);
        }
    }
}
