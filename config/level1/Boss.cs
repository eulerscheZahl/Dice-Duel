using System;
using System.Collections.Generic;
using System.Linq;

public class Agent1
{
    const int SIZE = 8;

    class Move
    {
        public string Sequence;
        public int StartX, StartY;
        public int FinalX, FinalY;
        public bool capture;

        public Move(string sequence, int startX, int startY, int finalX, int finalY, bool capture)
        {
            this.Sequence = sequence;
            this.StartX = startX;
            this.StartY = startY;
            this.FinalX = finalX;
            this.FinalY = finalY;
            this.capture = capture;
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

        public Die(int owner, int x, int y, int top)
        {
            this.Mine = owner == 0;
            this.X = x;
            this.Y = y;
            this.Top = top;
        }

        private Random random = new Random(0);
        public List<Move> ListMoves(List<Die> team, List<Die> opponent)
        {
            bool[,] visited = new bool[SIZE, SIZE];
            foreach (Die die in team) visited[die.X, die.Y] = true;
            bool[,] oppPlace = new bool[SIZE, SIZE];
            foreach (Die die in opponent) oppPlace[die.X, die.Y] = true;
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

        private void MoveRecurs(int x, int y, bool[,] visited, bool[,] oppPlace, string s, List<Move> moves)
        {
            if (s.Length == Top)
            {
                moves.Add(new Move(s, this.X, this.Y, x, y, oppPlace[x, y]));
                return;
            }
            if (oppPlace[x, y]) return;
            for (int dir = 0; dir < 4; dir++)
            {
                int x_ = x + dx[dir];
                int y_ = y + dy[dir];
                if (x_ < 0 || x_ >= SIZE || y_ < 0 || y_ >= SIZE || visited[x_, y_]) continue;
                visited[x_, y_] = true;
                MoveRecurs(x_, y_, visited, oppPlace, s + dirs[dir], moves);
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
                Dice.Add(new Die(owner, x, y, s0));
            }
        }

        public string Play()
        {
            List<Move> moves = new List<Move>();
            List<Die> myDice = Dice.Where(d => d.Mine).ToList();
            List<Die> oppDice = Dice.Where(d => !d.Mine).ToList();
            foreach (Die die in myDice)
            {
                moves.AddRange(die.ListMoves(myDice, oppDice));
            }
            foreach (Move move in moves)
            {
                if (move.capture) return move.ToString();
            }
            return moves[0].ToString();
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