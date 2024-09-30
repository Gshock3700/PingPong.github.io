from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('leaderboard.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10')
    leaderboard = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in leaderboard])

@app.route('/api/score', methods=['POST'])
def submit_score():
    data = request.json
    name = data['name']
    score = data['score']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO leaderboard (name, score) VALUES (?, ?)', (name, score))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
