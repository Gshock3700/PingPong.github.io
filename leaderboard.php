<?php
$db = new SQLite3('leaderboard.db');
$results = $db->query('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10');
?>

<h2>Leaderboard</h2>
<ul>
    <?php while ($row = $results->fetchArray()): ?>
        <li>
            <span><?= htmlspecialchars($row['name']) ?></span>
            <span><?= $row['score'] ?></span>
        </li>
    <?php endwhile; ?>
</ul>
