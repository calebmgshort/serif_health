Instructions: 
- It is assumed you already have npm and node installed on your machine. If not, please install them. I think creating a Dockerfile would have been overkill.
- Install dependencies: 'npm install'
- Execute the script: 'node find_urls.js path_to_index_file'

Solution Explained:
I loaded each element of reporting_structure into memory, one at a time. If a single plan in reporting_plans in the reporting structure had "ANTHEM" in the name, then all of the 
in_network_files in that reporting structure were assumed to be Anthem. For each of the in_network_files, if the description included "New York" and "PPO", the corresponding URL 
was assumed to be a list of rates for a PPO plan in New York. The query parameters in the URL were removed.
Time spent:
The solution took me a few hours. Longer than the 2 hour max requested but not crazy. 

Running time: 
The running time was 423 seconds on my machine.

Tradeoffs:
- I avoided duplicating urls in the output list via a Set. This worked fine for the input file provided. However, in the case where there were a huge number of urls to output, the 
  limited memory of the computer would be a problem for the Set solution. I could have used a sqlite db to achieve the same thing more robustly but that felt over-engineered for 
  the scope of this assignment.
- I didn't bother overwriting any existing output file, so if you run the script a second time without removing the output file the results from subsequent runs will get appendedto , not replace the file. 

"Hints and Pointers":
- How do you handle the file size and format efficiently, when the uncompressed file will exceed memory limitations on most systems?
    Handled by using the npm stream-json package to load a single reporting_structure into memory at a time
- When you look at your output URL list, which segments of the URL are changing, which segments are repeating, and what might that mean?
    Handled by removing query parameters
- Is the 'description' field helpful? Is it complete? Does it change relative to 'location'? Is Highmark the same as Anthem?
    Description provides the information as to whether it is New York and whether it is PPO. Whether or not the rate is part of an Anthem plan is found in the plan_name in reporting_plans 
    and not file_locations. Also, I looked it up, and Anthem and Highmark are apparently completely separate entities (however, it is possible for them to collaborate in some regions).
- Anthem has an interactive MRF lookup system. This lookup can be used to gather additional information - but it requires you to input the EIN or name of an employer who offers an Anthem health 
  plan: Anthem EIN lookup. How might you find a business likely to be in the Anthem NY PPO? How can you use this tool to confirm if your answer is complete?
    You can find such a business by using a single ein from an Anthem New York PPO plan in the index file provided.
    I used the Anthem EIN lookup, but only saw 16 URLs with NY in the name in the output, and the file names are very different from those in my output list. 

Other Notes:
- The solution in theory should work with both a zipped and non-zipped input file, but it was tested with a zipped file. 
- All of the urls in the output list are found in the first second of processing. 
- I suspect my solution is lacking as my output list is very different from what I see on the anthem.com EIN lookup. Regardless, this was a very interesting problem to work on. 
  Whether I pass or not, I would really appreciate if you would tell me what I'm missing / what I did wrong (if anything).
