
import re

file_path = '/Users/thi/Devops/i-cv/index.html'

with open(file_path, 'r') as f:
    content = f.read()

# Function to process a card type
def process_cards(text, card_class, icon_class):
    # Pattern to find the start of a card and its icon
    # We capture:
    # 1. The opening div of the card (including attributes)
    # 2. The entire icon div block
    # 3. The icon class (bi-...) from the i tag
    
    # Example:
    # <div class="skill-card" data-aos="fade-up" data-aos-delay="0">
    #     <div class="skill-icon">
    #         <i class="bi bi-gear-fill"></i>
    #     </div>
    
    pattern = r'(<div class="' + card_class + r'"[^>]*>)\s*(<div class="' + icon_class + r'">\s*<i class="([^"]+)"></i>\s*</div>)'
    
    def replacer(match):
        card_open = match.group(1)
        icon_block = match.group(2)
        icon_class_name = match.group(3)
        
        # New structure
        new_block = f'''{card_open}
                    <div class="icon-blur-container">
                        <div class="{icon_class}">
                            <i class="{icon_class_name}"></i>
                        </div>
                    </div>
                    <div style="position: relative; z-index: 1;">
                        {icon_block}'''
        return new_block

    # Replace the start
    new_text = re.sub(pattern, replacer, text)
    
    # Now we need to close the extra div we added.
    # Since we can't easily find the matching closing div for the card with regex,
    # we'll look for the class of the NEXT element usually inside the card, 
    # OR we can just rely on the fact that these cards end with a closing div followed by newline and space.
    
    # Actually, a safer way for the closing div:
    # The cards usually contain: Icon -> H4 -> P -> Div (progress) -> /Div (card)
    # or Icon -> H4 -> P -> P -> /Div (card for certs)
    
    # Let's simple append the </div> before the </div> that closes the card.
    # This is tricky with regex.
    
    return new_text

# Instead of complex regex for closing, let's rewrite the card blocks entirely since we have the distinct blocks in mind.
# We will iterate through the file line by line for safer processing.

lines = content.split('\n')
new_lines = []
in_card = False
card_type = None # 'skill' or 'cert'
indent = ""

i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Detect start of card
    if '<div class="skill-card"' in line:
        in_card = True
        card_type = 'skill'
        new_lines.append(line)
        # Look ahead for icon
        i += 1
        icon_lines = []
        while 'class="skill-icon"' not in lines[i]:
            new_lines.append(lines[i]) # Keep any intermediate lines? usually none
            i += 1
        
        # Capture icon block
        icon_start_line = lines[i] # <div class="skill-icon">
        i += 1
        icon_i_line = lines[i] # <i class="..."></i>
        i += 1
        icon_end_line = lines[i] # </div>
        
        # Extract icon class
        icon_class_match = re.search(r'class="([^"]+)"', icon_i_line)
        if icon_class_match:
             icon_cls = icon_class_match.group(1)
        else:
             icon_cls = "bi bi-question"
             
        # Inject Blur Container
        new_lines.append(f'{icon_start_line.replace("skill-icon", "icon-blur-container")}')
        new_lines.append(f'                        <div class="skill-icon">')
        new_lines.append(f'                            <i class="{icon_cls}"></i>')
        new_lines.append(f'                        </div>')
        new_lines.append(f'                    </div>')
        
        # Open Content Wrapper
        new_lines.append(f'                    <div style="position: relative; z-index: 1;">')
        
        # Add Original Icon
        new_lines.append(icon_start_line)
        new_lines.append(icon_i_line)
        new_lines.append(icon_end_line)
        
    elif '<div class="cert-card"' in line:
        in_card = True
        card_type = 'cert'
        new_lines.append(line)
        
        i += 1
        # Capture icon block
        icon_start_line = lines[i]
        i += 1
        icon_i_line = lines[i]
        i += 1
        icon_end_line = lines[i]
        
        icon_class_match = re.search(r'class="([^"]+)"', icon_i_line)
        if icon_class_match:
             icon_cls = icon_class_match.group(1)
        else:
             icon_cls = "bi bi-question"

        # Inject Blur Container
        new_lines.append(f'{icon_start_line.replace("cert-icon", "icon-blur-container")}')
        new_lines.append(f'                        <div class="cert-icon">')
        new_lines.append(f'                            <i class="{icon_cls}"></i>')
        new_lines.append(f'                        </div>')
        new_lines.append(f'                    </div>')
        
        # Open Content Wrapper
        new_lines.append(f'                    <div style="position: relative; z-index: 1;">')
        
        # Add Original Icon
        new_lines.append(icon_start_line)
        new_lines.append(icon_i_line)
        new_lines.append(icon_end_line)

    elif in_card and stripped == '</div>':
        # Closing the card. We need to close the wrapper first.
        # But wait, there might be nested div closings (e.g. progress bar).
        # We need to rely on indentation or specific context.
        # In this file, the card closing div is usually indented with 16 spaces (4 tabs equiv) if card start is 16.
        # Let's check indentation.
        
        current_indent = len(line) - len(line.lstrip())
        # Assuming the card closing div has the same indentation as the opening one.
        # We can look at the previous lines to see if it matches the card start? 
        # Actually, let's just close the wrapper before the card closes.
        # Since we are iterating, we need to know WHICH </div> this is.
        # The cards have:
        # Skills: icon / h4 / p / div(progress) / /div(card)
        # Certs: icon / h4 / p / p / /div(card)
        
        # Just processing lines until we hit the card close.
        # Since I can't easily parse context in this simple loop, let's use a counter?
        # No, let's look at the indentation.
        # The card div is at indentation X. The closing div should be at indentation X.
        
        # Let's simplify.
        new_lines.append(line)
        
    else:
        new_lines.append(line)
        
    i += 1

# Re-processing to close the div correctly. 
# The manual parser above is fragile with nested divs.
# Let's go back to using the fact that I know the content structure.

final_lines = []
for line in new_lines:
    final_lines.append(line)

# Let's try a different approach.
# Read the file content, regex match each full card block, and replace it.

full_text = content

def replace_skill_card(match):
    full_block = match.group(0)
    # Extract pieces
    icon_cls = re.search(r'class="skill-icon".*?<i class="([^"]+)"', full_block, re.DOTALL).group(1)
    
    # Inject start
    block_content = full_block.replace('<div class="skill-card"', '<div class="skill-card" ##marker##', 1)
    
    parts = block_content.split('##marker##')
    start_tag = parts[0].replace(' ##marker##', '')
    rest = parts[1]
    
    # Find the first div (icon)
    # The regex ensures we matched the whole card? No, we need to match the whole card from <div class="skill-card"> to the matching </div>
    # That is hard with regex.
    return full_block # Fallback

# Okay, simple string replacement for every occurrence of the card content body
# Locate the icon div, add the header stuff before it.
# Locate the closing div of the card, add the closing div before it.
# This assumes consistent formatting.

refined_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    if '<div class="skill-card"' in line or '<div class="cert-card"' in line:
        refined_lines.append(line)
        
        # Advance to icon
        i += 1
        while 'class="skill-icon"' not in lines[i] and 'class="cert-icon"' not in lines[i]:
             refined_lines.append(lines[i])
             i += 1
        
        # Now at icon start
        icon_type = "skill-icon" if "skill-icon" in lines[i] else "cert-icon"
        icon_start = lines[i]
        i += 1
        icon_i = lines[i]
        i += 1
        icon_end = lines[i]
        
        icon_cls = re.search(r'class="([^"]+)"', icon_i).group(1)
        
        # Add Blur Container
        refined_lines.append(f'                    <div class="icon-blur-container">')
        refined_lines.append(f'                        <div class="{icon_type}">')
        refined_lines.append(f'                            <i class="{icon_cls}"></i>')
        refined_lines.append(f'                        </div>')
        refined_lines.append(f'                    </div>')
        
        # Add Content Wrapper Start
        refined_lines.append(f'                    <div style="position: relative; z-index: 1;">')
        
        # Add Original Icon
        refined_lines.append(icon_start)
        refined_lines.append(icon_i)
        refined_lines.append(icon_end)
        
        # Process until card end
        # We need to find the matching closing div.
        # Since these cards are simple, we can assume the closing div is the one with the same indentation as the start.
        # card start indentation is 16 spaces.
        
        card_indent = 16
        
        # Continue loop
    elif line.strip() == '</div>' and (len(line) - len(line.lstrip())) == 16:
        # Check if we were in a card (by context, checking matching <div> stack would be better but this file is regular)
        # However, checking if this specific </div closes a card we modified is tricky state tracking.
        # Let's just look if the PREVIOUS lines were part of a card.
        # Hack: Check if we are inside the 'skills-grid' or 'cert-grid'.
        
        # Actually, simply:
        # If we just modified a card start, we are "in a card".
        # We can add a flag.
        
        refined_lines.append('                    </div>') # Close content wrapper
        refined_lines.append(line) # Close card
    else:
        refined_lines.append(line)
    
    i += 1

# The logic above regarding closing div is too loose. It might close the container div.
# Correct indentation for card closing is 16 spaces.
# Container closing is 12 or 8.
# So looking for 16 spaces indentation for </div> is a reasonable heuristic for this specific file.

# Let's restart the loop with the flag approach.

final_output = []
in_target_card = False

idx = 0
while idx < len(lines):
    line = lines[idx]
    indent = len(line) - len(line.lstrip())
    
    if ('<div class="skill-card"' in line or '<div class="cert-card"' in line):
        in_target_card = True
        final_output.append(line)
        
        # Process header
        idx += 1
        # Skip potential empty lines or comments until icon
        while 'class="skill-icon"' not in lines[idx] and 'class="cert-icon"' not in lines[idx]:
             final_output.append(lines[idx])
             idx += 1
             
        # Icon block
        icon_type = "skill-icon" if "skill-icon" in lines[idx] else "cert-icon"
        icon_start = lines[idx]
        idx += 1
        icon_i = lines[idx]
        idx += 1
        icon_end = lines[idx]
        
        icon_cls_match = re.search(r'class="([^"]+)"', icon_i)
        icon_cls = icon_cls_match.group(1) if icon_cls_match else "bi bi-star"

        # Inject Blur
        final_output.append(f'                    <div class="icon-blur-container">')
        final_output.append(f'                        <div class="{icon_type}">')
        final_output.append(f'                            <i class="{icon_cls}"></i>')
        final_output.append(f'                        </div>')
        final_output.append(f'                    </div>')
        final_output.append(f'                    <div style="position: relative; z-index: 1;">')
        
        final_output.append(icon_start)
        final_output.append(icon_i)
        final_output.append(icon_end)
        
    elif in_target_card and line.strip() == '</div>' and indent == 16:
        # Closing the card
        final_output.append('                    </div>') # Close wrapper
        final_output.append(line)
        in_target_card = False
    else:
        final_output.append(line)
    
    idx += 1

with open(file_path, 'w') as f:
    f.write('\n'.join(final_output))
